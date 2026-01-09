<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'name_ar',
        'sku',
        'barcode',
        'description',
        'category_id',
        'purchase_price',
        'selling_price',
        'quantity',
        'unit',
        'min_stock',
        'location',
        'image',
        'is_active',
    ];

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'quantity' => 'decimal:2',
        'min_stock' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected $appends = ['image_url', 'is_low_stock', 'profit_margin'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function suppliers()
    {
        return $this->belongsToMany(Supplier::class, 'product_supplier')
            ->withPivot(['cost_price', 'supplier_sku', 'is_primary'])
            ->withTimestamps();
    }

    public function inventoryMovements()
    {
        return $this->hasMany(InventoryMovement::class);
    }

    public function billItems()
    {
        return $this->hasMany(BillItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('quantity', '<=', 'min_stock');
    }

    public function scopeInStock($query)
    {
        return $query->where('quantity', '>', 0);
    }

    public function scopeOutOfStock($query)
    {
        return $query->where('quantity', '<=', 0);
    }

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) {
            return null;
        }

        if (str_starts_with($this->image, 'http')) {
            return $this->image;
        }

        return Storage::url($this->image);
    }

    public function getIsLowStockAttribute(): bool
    {
        return $this->quantity <= $this->min_stock;
    }

    public function getProfitMarginAttribute(): float
    {
        if ($this->purchase_price <= 0) {
            return 0;
        }

        return round((($this->selling_price - $this->purchase_price) / $this->purchase_price) * 100, 2);
    }

    public function adjustStock(float $change, string $type, ?int $userId = null, ?int $billId = null, ?string $reason = null, ?string $notes = null): InventoryMovement
    {
        $quantityBefore = $this->quantity;
        $newQuantity = $this->quantity + $change;
        
        // Prevent negative stock - clamp to zero minimum
        if ($newQuantity < 0) {
            $newQuantity = 0;
        }
        
        $this->quantity = $newQuantity;
        $this->save();

        return $this->inventoryMovements()->create([
            'user_id' => $userId ?? auth()->id(),
            'bill_id' => $billId,
            'type' => $type,
            'quantity_before' => $quantityBefore,
            'quantity_change' => $change,
            'quantity_after' => $this->quantity,
            'unit_cost' => $this->purchase_price,
            'reason' => $reason,
            'notes' => $notes,
        ]);
    }
}
