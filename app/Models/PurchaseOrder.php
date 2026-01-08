<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'po_number',
        'supplier_id',
        'user_id',
        'status',
        'order_date',
        'expected_date',
        'received_date',
        'subtotal',
        'tax',
        'shipping',
        'total',
        'notes',
        'supplier_notes',
    ];

    protected $casts = [
        'order_date' => 'date',
        'expected_date' => 'date',
        'received_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'shipping' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    protected $appends = ['status_label', 'status_color'];

    /**
     * Generate a unique PO number.
     */
    public static function generatePoNumber(): string
    {
        $prefix = 'PO-' . date('Ym');
        $lastPo = static::where('po_number', 'like', $prefix . '%')
            ->orderBy('po_number', 'desc')
            ->first();

        if ($lastPo) {
            $lastNumber = (int) substr($lastPo->po_number, -4);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return $prefix . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    // Relationships

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function reorderSuggestions()
    {
        return $this->hasMany(ReorderSuggestion::class);
    }

    // Scopes

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['draft', 'sent', 'partial']);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'received');
    }

    // Accessors

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'draft' => __('Brouillon'),
            'sent' => __('Envoyée'),
            'partial' => __('Partielle'),
            'received' => __('Reçue'),
            'cancelled' => __('Annulée'),
            default => $this->status,
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'draft' => 'default',
            'sent' => 'info',
            'partial' => 'warning',
            'received' => 'success',
            'cancelled' => 'error',
            default => 'default',
        };
    }

    // Methods

    public function recalculateTotals(): void
    {
        $this->subtotal = $this->items()->sum('total');
        $this->total = $this->subtotal + $this->tax + $this->shipping;
        $this->save();
    }

    public function canReceive(): bool
    {
        return in_array($this->status, ['sent', 'partial']);
    }

    public function isFullyReceived(): bool
    {
        return $this->items->every(function ($item) {
            return $item->quantity_received >= $item->quantity_ordered;
        });
    }

    public function markAsSent(): void
    {
        $this->update(['status' => 'sent']);
    }

    public function markAsReceived(): void
    {
        $this->update([
            'status' => 'received',
            'received_date' => now(),
        ]);
    }
}
