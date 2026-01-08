<?php

namespace App\Listeners;

use App\Events\BillCancelled;
use App\Models\AuditLog;

class LogBillCancellation
{
    public function handle(BillCancelled $event): void
    {
        $bill = $event->bill;
        
        AuditLog::record(
            entity: $bill,
            action: AuditLog::ACTION_CANCELLED,
            oldValues: [
                'status' => 'completed',
                'total' => $bill->total,
                'items_count' => $bill->items->count(),
            ],
            newValues: [
                'status' => 'cancelled',
                'cancelled_at' => now()->toDateTimeString(),
            ],
            reason: $event->reason,
            metadata: [
                'payment_method' => $bill->payment_method,
                'customer' => $bill->customer_name,
                'items' => $bill->items->map(fn($item) => [
                    'product' => $item->product_name,
                    'quantity' => $item->quantity,
                    'total' => $item->total,
                ])->toArray(),
            ]
        );
    }
}
