<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurchaseOrderReceiveTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Supplier $supplier;
    protected Product $product1;
    protected Product $product2;
    protected PurchaseOrder $purchaseOrder;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['role' => 'admin']);
        $this->supplier = Supplier::factory()->create();
        
        $this->product1 = Product::factory()->create([
            'name' => 'Test Product 1',
            'quantity' => 10,
            'min_stock' => 5,
        ]);
        
        $this->product2 = Product::factory()->create([
            'name' => 'Test Product 2',
            'quantity' => 20,
            'min_stock' => 10,
        ]);

        $this->purchaseOrder = PurchaseOrder::create([
            'po_number' => 'PO-TEST-001',
            'supplier_id' => $this->supplier->id,
            'user_id' => $this->user->id,
            'status' => 'sent',
            'order_date' => now(),
            'subtotal' => 1000,
            'total' => 1000,
        ]);

        $this->purchaseOrder->items()->createMany([
            [
                'product_id' => $this->product1->id,
                'product_name' => $this->product1->name,
                'product_sku' => $this->product1->sku,
                'quantity_ordered' => 50,
                'quantity_received' => 0,
                'unit' => 'pcs',
                'unit_cost' => 10,
                'total' => 500,
            ],
            [
                'product_id' => $this->product2->id,
                'product_name' => $this->product2->name,
                'product_sku' => $this->product2->sku,
                'quantity_ordered' => 50,
                'quantity_received' => 0,
                'unit' => 'pcs',
                'unit_cost' => 10,
                'total' => 500,
            ],
        ]);
    }

    /** @test */
    public function it_can_receive_items_and_update_stock(): void
    {
        $items = $this->purchaseOrder->items;

        $this->actingAs($this->user)
            ->post(route('purchases.receive', $this->purchaseOrder), [
                'items' => [
                    ['item_id' => $items[0]->id, 'quantity_received' => 30],
                    ['item_id' => $items[1]->id, 'quantity_received' => 20],
                ],
            ])
            ->assertRedirect(route('purchases.show', $this->purchaseOrder));

        // Check item quantities were updated
        $items[0]->refresh();
        $items[1]->refresh();
        
        $this->assertEquals(30, $items[0]->quantity_received);
        $this->assertEquals(20, $items[1]->quantity_received);

        // Check product stock was increased
        $this->product1->refresh();
        $this->product2->refresh();
        
        $this->assertEquals(40, $this->product1->quantity); // 10 + 30
        $this->assertEquals(40, $this->product2->quantity); // 20 + 20

        // Check PO status is partial (not fully received)
        $this->purchaseOrder->refresh();
        $this->assertEquals('partial', $this->purchaseOrder->status);
    }

    /** @test */
    public function it_marks_order_as_received_when_fully_received(): void
    {
        $items = $this->purchaseOrder->items;

        $this->actingAs($this->user)
            ->post(route('purchases.receive', $this->purchaseOrder), [
                'items' => [
                    ['item_id' => $items[0]->id, 'quantity_received' => 50],
                    ['item_id' => $items[1]->id, 'quantity_received' => 50],
                ],
            ])
            ->assertRedirect();

        $this->purchaseOrder->refresh();
        $this->assertEquals('received', $this->purchaseOrder->status);
        $this->assertNotNull($this->purchaseOrder->received_date);
    }

    /** @test */
    public function it_creates_inventory_movements_on_receive(): void
    {
        $items = $this->purchaseOrder->items;

        $this->actingAs($this->user)
            ->post(route('purchases.receive', $this->purchaseOrder), [
                'items' => [
                    ['item_id' => $items[0]->id, 'quantity_received' => 25],
                ],
            ]);

        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $this->product1->id,
            'type' => 'purchase',
            'quantity' => 25,
            'user_id' => $this->user->id,
        ]);
    }

    /** @test */
    public function it_cannot_receive_from_draft_order(): void
    {
        $this->purchaseOrder->update(['status' => 'draft']);

        $items = $this->purchaseOrder->items;

        $this->actingAs($this->user)
            ->post(route('purchases.receive', $this->purchaseOrder), [
                'items' => [
                    ['item_id' => $items[0]->id, 'quantity_received' => 10],
                ],
            ])
            ->assertSessionHasErrors('error');

        // Stock should not change
        $this->product1->refresh();
        $this->assertEquals(10, $this->product1->quantity);
    }

    /** @test */
    public function it_cannot_receive_more_than_ordered(): void
    {
        $items = $this->purchaseOrder->items;
        $item = $items[0];

        // Receive 30 first
        $item->receive(30, $this->user->id);
        $item->refresh();
        
        $this->assertEquals(30, $item->quantity_received);
        $this->assertEquals(20, $item->quantity_pending);

        // Now receive 30 more - should be clamped to 20
        $item->receive(30, $this->user->id);
        $item->refresh();

        $this->assertEquals(50, $item->quantity_received); // Clamped to max
    }

    /** @test */
    public function it_handles_partial_receiving_across_multiple_sessions(): void
    {
        $items = $this->purchaseOrder->items;

        // First receiving session
        $this->actingAs($this->user)
            ->post(route('purchases.receive', $this->purchaseOrder), [
                'items' => [
                    ['item_id' => $items[0]->id, 'quantity_received' => 20],
                ],
            ]);

        $this->purchaseOrder->refresh();
        $this->assertEquals('partial', $this->purchaseOrder->status);

        // Second receiving session
        $this->actingAs($this->user)
            ->post(route('purchases.receive', $this->purchaseOrder), [
                'items' => [
                    ['item_id' => $items[0]->id, 'quantity_received' => 30],
                    ['item_id' => $items[1]->id, 'quantity_received' => 50],
                ],
            ]);

        $items[0]->refresh();
        $items[1]->refresh();

        $this->assertEquals(50, $items[0]->quantity_received);
        $this->assertEquals(50, $items[1]->quantity_received);

        $this->purchaseOrder->refresh();
        $this->assertEquals('received', $this->purchaseOrder->status);

        // Verify total stock changes
        $this->product1->refresh();
        $this->assertEquals(60, $this->product1->quantity); // 10 + 50
    }
}
