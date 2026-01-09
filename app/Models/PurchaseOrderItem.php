<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_order_id',
        'product_id',
        'product_name',
        'product_sku',
        'quantity_ordered',
        'quantity_received',
        'unit',
        'unit_cost',
        'total',
    ];

    protected $casts = [
        'quantity_ordered' => 'decimal:2',
        'quantity_received' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    protected $appends = ['quantity_pending', 'is_fully_received'];

    // Relationships

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Accessors

    public function getQuantityPendingAttribute(): float
    {
        return max(0, $this->quantity_ordered - $this->quantity_received);
    }

    public function getIsFullyReceivedAttribute(): bool
    {
        return $this->quantity_received >= $this->quantity_ordered;
    }

    // Methods

    /**
     * Receive a quantity of this item and update product stock.
     */
    public function receive(float $quantity, ?int $userId = null): void
    {
        $quantityToReceive = min($quantity, $this->quantity_pending);

        if ($quantityToReceive <= 0) {
            return;
        }

        $this->quantity_received += $quantityToReceive;
        $this->save();

        // Update product stock - pass null for bill_id since this is from a purchase order
        $this->product->adjustStock(
            $quantityToReceive,
            'purchase',
            $userId ?? auth()->id(),
            null,
            'Réception commande - ' . $this->purchaseOrder->po_number,
            'PO#' . $this->purchaseOrder->id
        );
    }
}
