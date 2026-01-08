<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalyticsSnapshot extends Model
{
    protected $fillable = [
        'date',
        'type',
        'metrics',
    ];

    protected $casts = [
        'date' => 'date',
        'metrics' => 'array',
    ];

    // Snapshot types
    public const TYPE_DAILY_SALES = 'daily_sales';
    public const TYPE_INVENTORY_VALUATION = 'inventory_valuation';
    public const TYPE_CATEGORY_PERFORMANCE = 'category_performance';
    public const TYPE_PRODUCT_PERFORMANCE = 'product_performance';

    // Scopes
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    // Static helpers
    public static function upsert(string $date, string $type, array $metrics): self
    {
        return self::updateOrCreate(
            ['date' => $date, 'type' => $type],
            ['metrics' => $metrics]
        );
    }

    public static function getMetrics(string $date, string $type): ?array
    {
        $snapshot = self::where('date', $date)->where('type', $type)->first();
        return $snapshot?->metrics;
    }
}
