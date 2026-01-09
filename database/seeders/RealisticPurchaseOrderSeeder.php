<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class RealisticPurchaseOrderSeeder extends Seeder
{
    public function run(): void
    {
        $size = config('demo_seed.size', 'medium');
        $config = config("demo_seed.sizes.{$size}");
        $targetCount = $config['purchase_orders'];

        $this->command->info("  📋 Seeding {$targetCount} purchase orders...");

        $suppliers = Supplier::all();
        $products = Product::where('is_active', true)->get();

        if ($suppliers->isEmpty() || $products->isEmpty()) {
            $this->command->warn("    ⚠ No suppliers or products found, skipping POs.");
            return;
        }

        $statuses = ['draft', 'sent', 'received', 'received', 'received', 'partial', 'cancelled'];

        // Distribute POs over the past 180 days
        $startDate = now()->subDays(180);

        for ($i = 0; $i < $targetCount; $i++) {
            $daysAgo = mt_rand(0, 180);
            $createdAt = $startDate->copy()->addDays(180 - $daysAgo)->addHours(mt_rand(8, 18));

            $supplier = $suppliers->random();
            $status = $statuses[array_rand($statuses)];

            // Determine expected date based on status
            $orderDate = $createdAt->toDateString();
            $expectedDate = $createdAt->copy()->addDays(mt_rand(3, 14));
            $receivedDate = in_array($status, ['received', 'partial']) ? $expectedDate->copy()->addDays(mt_rand(-2, 3)) : null;

            $po = PurchaseOrder::create([
                'po_number' => 'PO-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'supplier_id' => $supplier->id,
                'user_id' => 1, // Admin user
                'status' => $status,
                'order_date' => $orderDate,
                'expected_date' => $expectedDate,
                'received_date' => $receivedDate,
                'subtotal' => 0,
                'tax' => 0,
                'shipping' => mt_rand(0, 10) > 7 ? mt_rand(500, 2000) : 0,
                'total' => 0,
                'notes' => mt_rand(1, 10) > 8 ? 'Commande urgente' : null,
                'created_at' => $createdAt,
                'updated_at' => $receivedDate ?? $createdAt,
            ]);

            // Add 2-8 items
            $numItems = mt_rand(2, 8);
            $subtotal = 0;
            $selectedProducts = $products->random(min($numItems, $products->count()));

            foreach ($selectedProducts as $product) {
                $quantity = mt_rand(5, 50);
                $unitCost = $product->purchase_price * (0.85 + mt_rand(0, 30) / 100);
                $lineTotal = $quantity * $unitCost;
                $subtotal += $lineTotal;

                $receivedQty = 0;
                if ($status === 'received') {
                    $receivedQty = $quantity;
                } elseif ($status === 'partial') {
                    $receivedQty = (int) ($quantity * (0.3 + mt_rand(0, 40) / 100));
                }

                PurchaseOrderItem::create([
                    'purchase_order_id' => $po->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity_ordered' => $quantity,
                    'quantity_received' => $receivedQty,
                    'unit_cost' => round($unitCost, 2),
                    'total' => round($lineTotal, 2),
                    'created_at' => $createdAt,
                    'updated_at' => $receivedDate ?? $createdAt,
                ]);
            }

            // Update PO totals
            $total = $subtotal + $po->shipping;
            $po->update([
                'subtotal' => round($subtotal, 2),
                'total' => round($total, 2),
            ]);
        }
    }
}
