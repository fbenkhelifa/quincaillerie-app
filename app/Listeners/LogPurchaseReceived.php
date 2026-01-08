<?php

namespace App\Listeners;

use App\Events\PurchaseReceived;
use App\Models\AuditLog;

class LogPurchaseReceived
{
    public function handle(PurchaseReceived $event): void
    {
        $purchaseOrder = $event->purchaseOrder;
        
        AuditLog::record(
            entity: $purchaseOrder,
            action: AuditLog::ACTION_RECEIVED,
            oldValues: [
                'status' => 'pending',
            ],
            newValues: [
                'status' => 'received',
                'received_at' => now()->toDateTimeString(),
            ],
            reason: 'Marchandise réceptionnée',
            metadata: [
                'supplier' => $purchaseOrder->supplier?->name ?? 'N/A',
                'total' => $purchaseOrder->total,
                'items_received' => $event->receivedItems,
                'items_count' => count($event->receivedItems),
            ]
        );
    }
}
