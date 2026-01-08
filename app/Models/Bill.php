<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    use HasFactory;

    protected $fillable = [
        'bill_number',
        'user_id',
        'worker_id',
        'customer_name',
        'customer_phone',
        'subtotal',
        'discount',
        'tax',
        'total',
        'payment_method',
        'status',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($bill) {
            if (empty($bill->bill_number)) {
                $bill->bill_number = self::generateBillNumber();
            }
        });
    }

    public static function generateBillNumber(): string
    {
        $prefix = 'FAC';
        $date = now()->format('Ymd');
        $lastBill = self::whereDate('created_at', today())->orderBy('id', 'desc')->first();
        $sequence = $lastBill ? (intval(substr($lastBill->bill_number, -4)) + 1) : 1;
        
        return sprintf('%s-%s-%04d', $prefix, $date, $sequence);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }

    public function items()
    {
        return $this->hasMany(BillItem::class);
    }

    public function inventoryMovements()
    {
        return $this->hasMany(InventoryMovement::class);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function calculateTotals(): void
    {
        $subtotal = $this->items->sum('total');
        $this->subtotal = $subtotal;
        $this->total = $subtotal - $this->discount + $this->tax;
        $this->save();
    }

    public function getPaymentMethodLabel(): string
    {
        return match($this->payment_method) {
            'cash' => 'Espèces',
            'card' => 'Carte bancaire',
            'check' => 'Chèque',
            'credit' => 'Crédit',
            default => 'Autre',
        };
    }

    public function getStatusLabel(): string
    {
        return match($this->status) {
            'pending' => 'En attente',
            'completed' => 'Terminée',
            'cancelled' => 'Annulée',
            default => $this->status,
        };
    }
}
