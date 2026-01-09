<?php

namespace Database\Seeders;

use App\Models\Bill;
use App\Models\BillItem;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\Worker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class RealisticBillSeeder extends Seeder
{
    public function run(): void
    {
        $size = config('demo_seed.size', 'medium');
        $config = config("demo_seed.sizes.{$size}");
        $targetCount = $config['bills'];

        $this->command->info("  🧾 Seeding {$targetCount} bills...");

        $products = Product::where('is_active', true)->get();
        $workers = Worker::where('is_active', true)->get();

        if ($products->isEmpty() || $workers->isEmpty()) {
            $this->command->warn("    ⚠ No products or workers found, skipping bills.");
            return;
        }

        $paymentMethods = ['cash', 'card', 'check', 'credit'];
        $statuses = ['completed', 'completed', 'completed', 'completed', 'completed', 'pending', 'cancelled'];

        // Distribute bills over the past 365 days
        $startDate = now()->subDays(365);
        
        for ($i = 0; $i < $targetCount; $i++) {
            // Random date weighted towards recent
            $daysAgo = (int) pow(mt_rand(0, 100) / 100, 2) * 365;
            $createdAt = $startDate->copy()->addDays(365 - $daysAgo)->addHours(mt_rand(8, 20))->addMinutes(mt_rand(0, 59));
            
            $worker = $workers->random();
            $status = $statuses[array_rand($statuses)];
            $paymentMethod = $paymentMethods[array_rand($paymentMethods)];

            // Generate unique bill number
            $billNumber = 'FAC-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT);

            // Create bill
            $bill = Bill::create([
                'bill_number' => $billNumber,
                'worker_id' => $worker->id,
                'customer_name' => $this->generateCustomerName(),
                'customer_phone' => $this->generatePhone(),
                'payment_method' => $paymentMethod,
                'status' => $status,
                'notes' => mt_rand(1, 10) > 8 ? 'Client régulier' : null,
                'subtotal' => 0,
                'tax' => 0,
                'discount' => mt_rand(0, 10) > 8 ? mt_rand(100, 500) : 0,
                'total' => 0,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            // Add 1-6 items to the bill
            $numItems = mt_rand(1, 6);
            $subtotal = 0;
            $selectedProducts = $products->random(min($numItems, $products->count()));

            foreach ($selectedProducts as $product) {
                $quantity = mt_rand(1, 5);
                $unitPrice = $product->selling_price;
                $lineTotal = $quantity * $unitPrice;
                $subtotal += $lineTotal;

                BillItem::create([
                    'bill_id' => $bill->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total' => $lineTotal,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                // Create inventory movement for completed bills
                if ($status === 'completed') {
                    $quantityBefore = $product->quantity;
                    $quantityAfter = $quantityBefore - $quantity;
                    
                    InventoryMovement::create([
                        'product_id' => $product->id,
                        'bill_id' => $bill->id,
                        'type' => 'sale',
                        'quantity_before' => $quantityBefore,
                        'quantity_change' => -$quantity,
                        'quantity_after' => $quantityAfter,
                        'unit_cost' => $product->purchase_price,
                        'reason' => 'sale',
                        'reference' => "FAC-{$bill->id}",
                        'notes' => "Vente - Facture #{$bill->id}",
                        'created_at' => $createdAt,
                        'updated_at' => $createdAt,
                    ]);
                }
            }

            // Update bill totals
            $total = $subtotal - $bill->discount;
            $bill->update([
                'subtotal' => $subtotal,
                'total' => $total,
            ]);

            // Progress indicator
            if ($i > 0 && $i % 500 === 0) {
                $this->command->info("    Processed {$i}/{$targetCount} bills...");
            }
        }
    }

    private function generateCustomerName(): ?string
    {
        if (mt_rand(1, 10) > 6) return null; // 40% anonymous

        $firstNames = ['Mohamed', 'Ahmed', 'Youcef', 'Karim', 'Ali', 'Omar', 'Rachid', 'Samir', 'Fatima', 'Amina', 'Samira', 'Nadia'];
        $lastNames = ['Benali', 'Kaci', 'Hamdi', 'Boudiaf', 'Larbi', 'Messaoudi', 'Belmadi', 'Ouahab', 'Berkane', 'Ferhat'];

        return $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)];
    }

    private function generatePhone(): ?string
    {
        if (mt_rand(1, 10) > 5) return null; // 50% no phone

        $prefixes = ['055', '056', '057', '066', '067', '077'];
        return $prefixes[array_rand($prefixes)] . mt_rand(1000000, 9999999);
    }
}
