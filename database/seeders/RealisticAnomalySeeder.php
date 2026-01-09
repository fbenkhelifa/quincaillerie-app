<?php

namespace Database\Seeders;

use App\Models\AnomalyFinding;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class RealisticAnomalySeeder extends Seeder
{
    public function run(): void
    {
        $size = config('demo_seed.size', 'medium');
        $config = config("demo_seed.sizes.{$size}");
        
        // Create anomalies proportional to product count
        $targetCount = (int) ($config['products'] * 0.1); // 10% of products have anomalies

        $this->command->info("  ⚠️  Seeding {$targetCount} anomaly findings...");

        $products = Product::all();
        
        if ($products->isEmpty()) {
            $this->command->warn("    ⚠ No products found, skipping anomalies.");
            return;
        }

        $types = [
            'low_stock' => ['severity' => 'medium', 'titleTemplate' => 'Stock bas: %s'],
            'stockout' => ['severity' => 'high', 'titleTemplate' => 'Rupture de stock: %s'],
            'price_anomaly' => ['severity' => 'low', 'titleTemplate' => 'Anomalie de prix: %s'],
            'slow_moving' => ['severity' => 'low', 'titleTemplate' => 'Rotation lente: %s'],
            'large_adjustment' => ['severity' => 'medium', 'titleTemplate' => 'Ajustement important: %s'],
            'high_discount' => ['severity' => 'high', 'titleTemplate' => 'Remise excessive: %s'],
        ];

        $statuses = ['new', 'new', 'new', 'investigating', 'resolved', 'dismissed'];

        for ($i = 0; $i < $targetCount; $i++) {
            $product = $products->random();
            $typeKey = array_rand($types);
            $typeConfig = $types[$typeKey];
            
            $daysAgo = mt_rand(0, 30);
            $detectedAt = now()->subDays($daysAgo)->subHours(mt_rand(0, 23));
            
            $status = $statuses[array_rand($statuses)];
            $reviewedAt = $status === 'resolved' ? $detectedAt->copy()->addDays(mt_rand(1, 5)) : null;

            // Build title and explanation based on type
            $title = sprintf($typeConfig['titleTemplate'], $product->name);
            $explanation = match($typeKey) {
                'low_stock' => sprintf('Le produit "%s" a un stock de %d unités (seuil: %d).', $product->name, $product->quantity, $product->min_stock),
                'stockout' => sprintf('Le produit "%s" est en rupture de stock.', $product->name),
                'large_adjustment' => sprintf('Un ajustement de stock important a été effectué sur "%s".', $product->name),
                'high_discount' => sprintf('Une remise de plus de 30%% a été appliquée sur "%s".', $product->name),
                default => sprintf('Anomalie détectée pour le produit "%s".', $product->name),
            };

            AnomalyFinding::create([
                'type' => $typeKey,
                'severity' => $typeConfig['severity'],
                'entity_type' => 'App\\Models\\Product',
                'entity_id' => $product->id,
                'title' => $title,
                'explanation' => $explanation,
                'metadata' => [
                    'product_sku' => $product->sku,
                    'current_stock' => $product->quantity,
                    'min_stock' => $product->min_stock,
                    'selling_price' => $product->selling_price,
                    'purchase_price' => $product->purchase_price,
                ],
                'status' => $status,
                'reviewed_at' => $reviewedAt,
                'reviewed_by' => $reviewedAt ? 1 : null,
                'detected_at' => $detectedAt,
                'created_at' => $detectedAt,
                'updated_at' => $reviewedAt ?? $detectedAt,
            ]);
        }
    }
}
