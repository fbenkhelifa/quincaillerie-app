<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'bill_id',
        'type',
        'quantity_before',
        'quantity_change',
        'quantity_after',
        'unit_cost',
        'reason',
        'notes',
        'reference',
    ];

    protected $casts = [
        'quantity_before' => 'decimal:2',
        'quantity_change' => 'decimal:2',
        'quantity_after' => 'decimal:2',
        'unit_cost' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bill()
    {
        return $this->belongsTo(Bill::class);
    }

    public function getTypeLabel(): string
    {
        return match($this->type) {
            'sale' => 'Vente',
            'purchase' => 'Achat',
            'adjustment' => 'Ajustement',
            'return' => 'Retour',
            'damage' => 'Dommage',
            'transfer' => 'Transfert',
            default => $this->type,
        };
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }
}
