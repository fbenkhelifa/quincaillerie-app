<?php

namespace Database\Seeders;

use App\Models\AnomalyFinding;
use App\Models\AuditLog;
use App\Models\AnalyticsSnapshot;
use App\Models\Bill;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AnalyticsDemoSeeder extends Seeder
{
    /**
     * Seed demo data for the Analytics & Risk module.
     */
    public function run(): void
    {
        $this->seedAnomalyFindings();
        $this->seedAuditLogs();
        $this->seedAnalyticsSnapshots();
    }

    /**
     * Create demo anomaly findings.
     */
    private function seedAnomalyFindings(): void
    {
        $products = Product::limit(20)->get();
        $bills = Bill::limit(10)->get();

        // Repeated cancellations
        if ($bills->isNotEmpty()) {
            AnomalyFinding::create([
                'type' => AnomalyFinding::TYPE_REPEATED_CANCELLATION,
                'severity' => 'critical',
                'entity_type' => 'App\\Models\\User',
                'entity_id' => 1,
                'title' => 'Annulations répétées détectées pour Caissier Ahmed',
                'explanation' => 'L\'utilisateur a annulé 8 factures au cours des 7 derniers jours, ce qui dépasse le seuil normal de 3. Cela peut indiquer une fraude potentielle ou un problème de formation.',
                'metadata' => [
                    'cancelled_bills_count' => 8,
                    'total_amount_cancelled' => 15420.50,
                    'period_days' => 7,
                    'threshold' => 3,
                ],
                'impact_value' => 15420.50,
                'status' => 'new',
                'detected_at' => now()->subHours(2),
            ]);
        }

        // Negative stock
        if ($products->isNotEmpty()) {
            $product = $products->first();
            AnomalyFinding::create([
                'type' => AnomalyFinding::TYPE_NEGATIVE_STOCK,
                'severity' => 'high',
                'entity_type' => 'App\\Models\\Product',
                'entity_id' => $product->id,
                'title' => "Stock négatif: {$product->name}",
                'explanation' => "Le produit a un stock de -5 unités. Cela indique une erreur de comptage ou une vente non enregistrée correctement.",
                'metadata' => [
                    'current_stock' => -5,
                    'product_name' => $product->name,
                    'cost_price' => $product->cost_price,
                ],
                'impact_value' => abs(-5) * ($product->cost_price ?? 50),
                'status' => 'investigating',
                'detected_at' => now()->subDays(1),
            ]);
        }

        // Large adjustment
        if ($products->count() > 1) {
            $product = $products->get(1);
            AnomalyFinding::create([
                'type' => AnomalyFinding::TYPE_LARGE_ADJUSTMENT,
                'severity' => 'high',
                'entity_type' => 'App\\Models\\Product',
                'entity_id' => $product->id,
                'title' => "Ajustement important: {$product->name}",
                'explanation' => "Un ajustement de -150 unités a été effectué, représentant 75% du stock total. Cette modification significative nécessite une vérification.",
                'metadata' => [
                    'adjustment_quantity' => -150,
                    'stock_before' => 200,
                    'stock_after' => 50,
                    'percentage_change' => 75,
                ],
                'impact_value' => 150 * ($product->cost_price ?? 35),
                'status' => 'new',
                'detected_at' => now()->subHours(6),
            ]);
        }

        // High discount
        if ($bills->isNotEmpty()) {
            $bill = $bills->first();
            AnomalyFinding::create([
                'type' => AnomalyFinding::TYPE_HIGH_DISCOUNT,
                'severity' => 'medium',
                'entity_type' => 'App\\Models\\Bill',
                'entity_id' => $bill->id,
                'title' => "Remise excessive: Facture #{$bill->id}",
                'explanation' => "Une remise de 45% a été appliquée à cette facture, dépassant le seuil autorisé de 25%. Vérifiez si cette remise a été autorisée par un responsable.",
                'metadata' => [
                    'discount_percentage' => 45,
                    'discount_amount' => 890.00,
                    'original_total' => 1977.78,
                    'final_total' => 1087.78,
                    'threshold' => 25,
                ],
                'impact_value' => 890.00,
                'status' => 'new',
                'detected_at' => now()->subHours(12),
            ]);
        }

        // Dead stock
        if ($products->count() > 2) {
            $product = $products->get(2);
            AnomalyFinding::create([
                'type' => AnomalyFinding::TYPE_DEAD_STOCK,
                'severity' => 'medium',
                'entity_type' => 'App\\Models\\Product',
                'entity_id' => $product->id,
                'title' => "Stock dormant: {$product->name}",
                'explanation' => "Ce produit n'a eu aucun mouvement depuis 120 jours avec 85 unités en stock, représentant une valeur bloquée de 4,250 DA.",
                'metadata' => [
                    'days_without_movement' => 120,
                    'stock_quantity' => 85,
                    'last_movement_date' => now()->subDays(120)->toDateString(),
                ],
                'impact_value' => 85 * 50,
                'status' => 'new',
                'detected_at' => now()->subDays(2),
            ]);
        }

        // Price override
        if ($products->count() > 3) {
            $product = $products->get(3);
            AnomalyFinding::create([
                'type' => AnomalyFinding::TYPE_PRICE_OVERRIDE,
                'severity' => 'medium',
                'entity_type' => 'App\\Models\\Product',
                'entity_id' => $product->id,
                'title' => "Modification de prix significative: {$product->name}",
                'explanation' => "Le prix de vente a été modifié de 450 DA à 280 DA (-38%). Cette réduction importante nécessite une vérification.",
                'metadata' => [
                    'old_price' => 450,
                    'new_price' => 280,
                    'percentage_change' => -38,
                ],
                'impact_value' => (450 - 280) * ($product->stock_quantity ?? 10),
                'status' => 'resolved',
                'detected_at' => now()->subDays(5),
                'reviewed_at' => now()->subDays(4),
                'resolution_notes' => 'Promotion validée par le directeur pour écouler le stock avant renouvellement.',
            ]);
        }

        // Some dismissed findings
        if ($products->count() > 4) {
            $product = $products->get(4);
            AnomalyFinding::create([
                'type' => AnomalyFinding::TYPE_STOCK_DISCREPANCY,
                'severity' => 'low',
                'entity_type' => 'App\\Models\\Product',
                'entity_id' => $product->id,
                'title' => "Écart de stock mineur: {$product->name}",
                'explanation' => "Un écart de 2 unités a été détecté lors de l'inventaire. Stock système: 48, Stock physique: 46.",
                'metadata' => [
                    'system_stock' => 48,
                    'physical_stock' => 46,
                    'difference' => -2,
                ],
                'impact_value' => 2 * 25,
                'status' => 'dismissed',
                'detected_at' => now()->subDays(10),
                'reviewed_at' => now()->subDays(9),
                'resolution_notes' => 'Écart normal dû à la casse. Ajustement effectué.',
            ]);
        }

        // Unusual void
        AnomalyFinding::create([
            'type' => AnomalyFinding::TYPE_UNUSUAL_VOID,
            'severity' => 'high',
            'entity_type' => 'App\\Models\\User',
            'entity_id' => 2,
            'title' => 'Annulations inhabituelles hors horaires',
            'explanation' => '3 annulations ont été effectuées entre 23h et 6h par l\'utilisateur Mohamed. Ces opérations hors heures d\'ouverture nécessitent une vérification.',
            'metadata' => [
                'void_count' => 3,
                'time_range' => '23h00 - 06h00',
                'total_voided' => 2340.00,
                'dates' => [
                    now()->subDays(1)->format('Y-m-d'),
                    now()->subDays(2)->format('Y-m-d'),
                ],
            ],
            'impact_value' => 2340.00,
            'status' => 'new',
            'detected_at' => now()->subHours(4),
        ]);
    }

    /**
     * Create demo audit logs.
     */
    private function seedAuditLogs(): void
    {
        $users = User::limit(5)->get();
        $products = Product::limit(10)->get();
        $bills = Bill::limit(10)->get();

        $actions = [
            ['action' => 'created', 'event' => 'Produit créé'],
            ['action' => 'updated', 'event' => 'Produit modifié'],
            ['action' => 'adjusted', 'event' => 'Stock ajusté'],
            ['action' => 'cancelled', 'event' => 'Facture annulée'],
            ['action' => 'received', 'event' => 'Commande réceptionnée'],
        ];

        // Generate 50 random audit logs
        for ($i = 0; $i < 50; $i++) {
            $action = $actions[array_rand($actions)];
            $user = $users->isNotEmpty() ? $users->random() : null;
            $date = now()->subHours(rand(1, 168)); // Last 7 days

            $entity = match ($action['action']) {
                'cancelled' => $bills->isNotEmpty() ? $bills->random() : null,
                default => $products->isNotEmpty() ? $products->random() : null,
            };

            if (!$entity) continue;

            $oldValues = [];
            $newValues = [];

            if ($action['action'] === 'updated') {
                $oldValues = ['selling_price' => rand(100, 500)];
                $newValues = ['selling_price' => rand(100, 500)];
            } elseif ($action['action'] === 'adjusted') {
                $oldQty = rand(10, 100);
                $adjustment = rand(-20, 50);
                $oldValues = ['stock_quantity' => $oldQty];
                $newValues = ['stock_quantity' => $oldQty + $adjustment, 'adjustment' => $adjustment];
            } elseif ($action['action'] === 'cancelled') {
                $oldValues = ['status' => 'completed'];
                $newValues = ['status' => 'cancelled'];
            }

            AuditLog::create([
                'user_id' => $user?->id,
                'user_name' => $user?->name ?? 'Système',
                'action' => $action['action'],
                'event' => $action['event'] . ' - ' . ($entity->name ?? "#{$entity->id}"),
                'auditable_type' => get_class($entity),
                'auditable_id' => $entity->id,
                'old_values' => $oldValues ?: null,
                'new_values' => $newValues ?: null,
                'reason' => $action['action'] === 'cancelled' ? 'Erreur de saisie client' : null,
                'ip_address' => '192.168.1.' . rand(1, 255),
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }
    }

    /**
     * Create demo analytics snapshots.
     */
    private function seedAnalyticsSnapshots(): void
    {
        // Generate 90 days of sales snapshots
        for ($i = 90; $i >= 0; $i--) {
            $date = now()->subDays($i)->startOfDay();
            
            // Skip some random days for realism
            if (rand(1, 10) <= 1) continue;

            // Base values with some variance
            $baseRevenue = rand(15000, 45000);
            $ordersCount = rand(20, 80);
            $dayOfWeek = $date->dayOfWeek;
            
            // Weekend effect
            if ($dayOfWeek === 0 || $dayOfWeek === 6) {
                $baseRevenue = (int) ($baseRevenue * 1.3);
                $ordersCount = (int) ($ordersCount * 1.2);
            }

            AnalyticsSnapshot::create([
                'date' => $date->toDateString(),
                'type' => 'sales',
                'metrics' => [
                    'total_revenue' => $baseRevenue,
                    'total_orders' => $ordersCount,
                    'average_order' => round($baseRevenue / max($ordersCount, 1), 2),
                    'cancellations' => rand(0, 3),
                    'payment_methods' => [
                        'cash' => (int) ($baseRevenue * 0.6),
                        'card' => (int) ($baseRevenue * 0.3),
                        'check' => (int) ($baseRevenue * 0.1),
                    ],
                ],
            ]);
        }

        // Generate 90 days of inventory snapshots
        $baseValue = rand(800000, 1200000);
        for ($i = 90; $i >= 0; $i--) {
            $date = now()->subDays($i)->startOfDay();
            
            // Skip some random days
            if (rand(1, 5) <= 1) continue;

            // Gradual trend with some noise
            $valueChange = rand(-20000, 30000);
            $baseValue = max(500000, $baseValue + $valueChange);

            AnalyticsSnapshot::create([
                'date' => $date->toDateString(),
                'type' => 'inventory',
                'metrics' => [
                    'total_value' => $baseValue,
                    'retail_value' => (int) ($baseValue * 1.35),
                    'total_items' => rand(5000, 8000),
                    'out_of_stock_count' => rand(5, 25),
                    'low_stock_count' => rand(15, 50),
                    'movements_in' => rand(100, 500),
                    'movements_out' => rand(80, 400),
                ],
            ]);
        }
    }
}
