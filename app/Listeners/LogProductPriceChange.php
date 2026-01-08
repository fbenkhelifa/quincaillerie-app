<?php

namespace App\Listeners;

use App\Events\ProductPriceChanged;
use App\Models\AnomalyFinding;
use App\Models\AuditLog;

class LogProductPriceChange
{
    public function handle(ProductPriceChanged $event): void
    {
        $product = $event->product;
        $percentChange = $event->getPercentageChange();
        
        // Log the audit trail
        AuditLog::record(
            entity: $product,
            action: AuditLog::ACTION_UPDATED,
            oldValues: [
                'selling_price' => $event->oldPrice,
            ],
            newValues: [
                'selling_price' => $event->newPrice,
            ],
            reason: $event->reason,
            metadata: [
                'percentage_change' => $percentChange,
                'product_name' => $product->name,
                'category' => $product->category?->name,
            ]
        );

        // Flag significant price changes as potential anomalies
        if (abs($percentChange) >= 30) {
            AnomalyFinding::create([
                'type' => AnomalyFinding::TYPE_PRICE_OVERRIDE,
                'severity' => abs($percentChange) >= 50 ? 'high' : 'medium',
                'entity_type' => 'App\\Models\\Product',
                'entity_id' => $product->id,
                'title' => "Changement de prix significatif: {$product->name}",
                'explanation' => sprintf(
                    "Le prix de vente a été modifié de %.2f DH à %.2f DH (%+.1f%%). %s",
                    $event->oldPrice,
                    $event->newPrice,
                    $percentChange,
                    $event->reason ? "Raison: {$event->reason}" : "Aucune raison fournie."
                ),
                'metadata' => [
                    'old_price' => $event->oldPrice,
                    'new_price' => $event->newPrice,
                    'percentage_change' => $percentChange,
                ],
                'impact_value' => abs($event->newPrice - $event->oldPrice) * $product->stock_quantity,
                'status' => 'new',
            ]);
        }
    }
}
