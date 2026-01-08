<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReorderSuggestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'suggested_supplier_id',
        'recommended_qty',
        'current_stock',
        'reorder_point',
        'safety_stock',
        'avg_daily_demand',
        'forecasted_demand_30d',
        'projected_stockout_date',
        'urgency',
        'confidence',
        'reason_json',
        'forecast_data',
        'status',
        'purchase_order_id',
        'computed_at',
    ];

    protected $casts = [
        'recommended_qty' => 'decimal:2',
        'current_stock' => 'decimal:2',
        'reorder_point' => 'decimal:2',
        'safety_stock' => 'decimal:2',
        'avg_daily_demand' => 'decimal:4',
        'forecasted_demand_30d' => 'decimal:2',
        'projected_stockout_date' => 'date',
        'confidence' => 'decimal:2',
        'reason_json' => 'array',
        'forecast_data' => 'array',
        'computed_at' => 'datetime',
    ];

    protected $appends = ['urgency_label', 'urgency_color', 'days_until_stockout'];

    // Relationships

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function suggestedSupplier()
    {
        return $this->belongsTo(Supplier::class, 'suggested_supplier_id');
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    // Scopes

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCritical($query)
    {
        return $query->where('urgency', 'critical');
    }

    public function scopeHighPriority($query)
    {
        return $query->whereIn('urgency', ['critical', 'high']);
    }

    public function scopeForSupplier($query, int $supplierId)
    {
        return $query->where('suggested_supplier_id', $supplierId);
    }

    // Accessors

    public function getUrgencyLabelAttribute(): string
    {
        return match ($this->urgency) {
            'critical' => __('Critique'),
            'high' => __('Haute'),
            'medium' => __('Moyenne'),
            'low' => __('Basse'),
            default => $this->urgency,
        };
    }

    public function getUrgencyColorAttribute(): string
    {
        return match ($this->urgency) {
            'critical' => 'error',
            'high' => 'warning',
            'medium' => 'info',
            'low' => 'success',
            default => 'default',
        };
    }

    public function getDaysUntilStockoutAttribute(): ?int
    {
        if (!$this->projected_stockout_date) {
            return null;
        }

        return max(0, now()->startOfDay()->diffInDays($this->projected_stockout_date, false));
    }

    // Methods

    /**
     * Get human-readable explanation of why this reorder is recommended.
     */
    public function getExplanation(): string
    {
        $reasons = $this->reason_json ?? [];
        $lines = [];

        if (isset($reasons['below_reorder_point'])) {
            $lines[] = __('Stock actuel (:current) est en dessous du point de commande (:reorder).', [
                'current' => number_format($this->current_stock, 0),
                'reorder' => number_format($this->reorder_point, 0),
            ]);
        }

        if (isset($reasons['high_demand'])) {
            $lines[] = __('Demande élevée détectée: :demand unités/jour en moyenne.', [
                'demand' => number_format($this->avg_daily_demand, 1),
            ]);
        }

        if (isset($reasons['stockout_imminent']) && $this->projected_stockout_date) {
            $lines[] = __('Rupture de stock prévue le :date.', [
                'date' => $this->projected_stockout_date->format('d/m/Y'),
            ]);
        }

        if (isset($reasons['seasonal_peak'])) {
            $lines[] = __('Période de forte demande saisonnière détectée.');
        }

        if (isset($reasons['lead_time_buffer'])) {
            $lines[] = __('Délai de livraison: :days jours. Commander maintenant pour éviter une rupture.', [
                'days' => $reasons['lead_time_buffer'],
            ]);
        }

        if (empty($lines)) {
            $lines[] = __('Recommandation basée sur le niveau de stock minimum configuré.');
        }

        return implode(' ', $lines);
    }

    /**
     * Approve this suggestion and optionally link to a purchase order.
     */
    public function approve(?int $purchaseOrderId = null): void
    {
        $this->update([
            'status' => $purchaseOrderId ? 'ordered' : 'approved',
            'purchase_order_id' => $purchaseOrderId,
        ]);
    }

    /**
     * Dismiss this suggestion.
     */
    public function dismiss(): void
    {
        $this->update(['status' => 'dismissed']);
    }
}
