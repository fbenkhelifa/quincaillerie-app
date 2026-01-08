<?php

namespace Tests\Feature;

use App\Models\Bill;
use App\Models\BillItem;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\Worker;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BillTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Worker $worker;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create(['role' => 'admin']);
        $this->worker = Worker::factory()->create();
        
        $category = Category::factory()->create();
        $this->product = Product::factory()->create([
            'category_id' => $category->id,
            'quantity' => 100,
            'selling_price' => 500,
        ]);
    }

    public function test_bills_index_page_is_displayed(): void
    {
        Bill::factory()->count(3)->create(['worker_id' => $this->worker->id]);

        $response = $this->actingAs($this->user)
            ->get(route('bills.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Bills/Index')
            ->has('bills.data', 3)
        );
    }

    public function test_bills_can_be_filtered_by_status(): void
    {
        Bill::factory()->count(2)->create([
            'worker_id' => $this->worker->id,
            'status' => 'completed',
        ]);
        Bill::factory()->count(1)->create([
            'worker_id' => $this->worker->id,
            'status' => 'cancelled',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('bills.index', ['status' => 'completed']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('bills.data', 2)
        );
    }

    public function test_create_bill_page_is_displayed(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('bills.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Bills/Create')
            ->has('workers')
        );
    }

    public function test_bill_can_be_created(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('bills.store'), [
                'worker_id' => $this->worker->id,
                'customer_name' => 'Test Customer',
                'customer_phone' => '0555123456',
                'payment_method' => 'cash',
                'discount' => 0,
                'tax' => 0,
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'product_name' => $this->product->name,
                        'quantity' => 5,
                        'unit' => 'pièce',
                        'unit_price' => 500,
                        'discount' => 0,
                    ],
                ],
            ]);

        $response->assertRedirect(route('bills.index'));
        
        $this->assertDatabaseHas('bills', [
            'customer_name' => 'Test Customer',
            'total' => 2500, // 5 * 500
            'status' => 'completed',
        ]);

        // Check that stock was deducted
        $this->assertEquals(95, $this->product->fresh()->quantity);
    }

    public function test_bill_creates_inventory_movement(): void
    {
        $this->actingAs($this->user)
            ->post(route('bills.store'), [
                'worker_id' => $this->worker->id,
                'payment_method' => 'cash',
                'discount' => 0,
                'tax' => 0,
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'product_name' => $this->product->name,
                        'quantity' => 10,
                        'unit' => 'pièce',
                        'unit_price' => 500,
                        'discount' => 0,
                    ],
                ],
            ]);

        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $this->product->id,
            'quantity' => 10,
            'type' => 'out',
            'reason' => 'sale',
        ]);
    }

    public function test_bill_cannot_be_created_with_insufficient_stock(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('bills.store'), [
                'worker_id' => $this->worker->id,
                'payment_method' => 'cash',
                'discount' => 0,
                'tax' => 0,
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'product_name' => $this->product->name,
                        'quantity' => 200, // More than available
                        'unit' => 'pièce',
                        'unit_price' => 500,
                        'discount' => 0,
                    ],
                ],
            ]);

        $response->assertSessionHasErrors();
        $this->assertEquals(100, $this->product->fresh()->quantity);
    }

    public function test_bill_show_page_is_displayed(): void
    {
        $bill = Bill::factory()->create(['worker_id' => $this->worker->id]);
        BillItem::factory()->create([
            'bill_id' => $bill->id,
            'product_id' => $this->product->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('bills.show', $bill));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Bills/Show')
            ->has('bill')
            ->has('bill.items')
        );
    }

    public function test_bill_can_be_cancelled(): void
    {
        $bill = Bill::factory()->create([
            'worker_id' => $this->worker->id,
            'status' => 'completed',
        ]);
        
        BillItem::factory()->create([
            'bill_id' => $bill->id,
            'product_id' => $this->product->id,
            'quantity' => 10,
        ]);

        // Simulate stock was already deducted
        $this->product->update(['quantity' => 90]);

        $response = $this->actingAs($this->user)
            ->post(route('bills.cancel', $bill));

        $response->assertRedirect();
        
        $this->assertEquals('cancelled', $bill->fresh()->status);
        // Stock should be restored
        $this->assertEquals(100, $this->product->fresh()->quantity);
    }

    public function test_bill_pdf_can_be_generated(): void
    {
        $bill = Bill::factory()->create(['worker_id' => $this->worker->id]);
        BillItem::factory()->create([
            'bill_id' => $bill->id,
            'product_id' => $this->product->id,
        ]);

        // Test French PDF
        $response = $this->actingAs($this->user)
            ->get(route('bills.pdf', ['bill' => $bill->id, 'lang' => 'fr']));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');

        // Test Arabic PDF
        $response = $this->actingAs($this->user)
            ->get(route('bills.pdf', ['bill' => $bill->id, 'lang' => 'ar']));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_bill_with_discount_and_tax(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('bills.store'), [
                'worker_id' => $this->worker->id,
                'payment_method' => 'cash',
                'discount' => 100,
                'tax' => 50,
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'product_name' => $this->product->name,
                        'quantity' => 2,
                        'unit' => 'pièce',
                        'unit_price' => 500,
                        'discount' => 50, // Item discount
                    ],
                ],
            ]);

        $response->assertRedirect(route('bills.index'));
        
        // Total = (2 * 500 - 50) - 100 + 50 = 950 - 100 + 50 = 900
        $this->assertDatabaseHas('bills', [
            'subtotal' => 950,
            'discount' => 100,
            'tax' => 50,
            'total' => 900,
        ]);
    }
}
