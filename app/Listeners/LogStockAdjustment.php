<?php

namespace App\Listeners;

use App\Events\StockAdjusted;
use App\Models\AuditLog;

class LogStockAdjustment
{
    public function handle(StockAdjusted $event): void
    {
        $movement = $event->movement;
        $product = $movement->product;
        
        AuditLog::record(
            entity: $product,
            action: AuditLog::ACTION_ADJUSTED,
            oldValues: [
                'stock_quantity' => $product->stock_quantity - $movement->quantity,
            ],
            newValues: [
                'stock_quantity' => $product->stock_quantity,
                'adjustment' => $movement->quantity,
            ],
            reason: $event->reason ?? $movement->notes,
            metadata: [
                'movement_id' => $movement->id,
                'movement_type' => $movement->type,
                'reference' => $movement->reference,
                'cost_impact' => $movement->quantity * ($product->cost_price ?? 0),
            ]
        );
    }
}
