<?php

namespace App\Services\Analytics;

use App\Models\Bill;
use App\Models\BillItem;
use App\Models\Category;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\AnalyticsSnapshot;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class InventoryAnalyticsService
{
    protected int $cacheTtl = 300; // 5 minutes

    /**
     * Get current inventory valuation.
     */
    public function getCurrentValuation(): array
    {
        return Cache::remember('inventory_valuation', $this->cacheTtl, function () {
            $products = Product::select(
                'id',
                'name',
                'sku',
                'category_id',
                'quantity',
                'purchase_price',
                'selling_price',
                DB::raw('quantity * purchase_price as cost_value'),
                DB::raw('quantity * selling_price as retail_value')
            )->with('category:id,name')->get();

            $totalCostValue = $products->sum('cost_value');
            $totalRetailValue = $products->sum('retail_value');
            $totalUnits = $products->sum('quantity');
            $totalSkus = $products->count();

            $byCategory = $products->groupBy('category_id')->map(function ($items, $categoryId) {
                $first = $items->first();
                return [
                    'category_id' => $categoryId,
                    'category_name' => $first->category?->name ?? 'Non catégorisé',
                    'sku_count' => $items->count(),
                    'units' => $items->sum('quantity'),
                    'cost_value' => round($items->sum('cost_value'), 2),
                    'retail_value' => round($items->sum('retail_value'), 2),
                ];
            })->values();

            return [
                'summary' => [
                    'total_cost_value' => round($totalCostValue, 2),
                    'total_retail_value' => round($totalRetailValue, 2),
                    'potential_margin' => round($totalRetailValue - $totalCostValue, 2),
                    'margin_percentage' => $totalRetailValue > 0 
                        ? round((($totalRetailValue - $totalCostValue) / $totalRetailValue) * 100, 1) 
                        : 0,
                    'total_units' => $totalUnits,
                    'total_skus' => $totalSkus,
                ],
                'by_category' => $byCategory,
            ];
        });
    }

    /**
     * Get valuation history over time.
     */
    public function getValuationHistory(int $days = 30): array
    {
        $cacheKey = "valuation_history_{$days}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($days) {
            $snapshots = AnalyticsSnapshot::ofType(AnalyticsSnapshot::TYPE_INVENTORY_VALUATION)
                ->where('date', '>=', now()->subDays($days))
                ->orderBy('date')
                ->get();

            return $snapshots->map(function ($snapshot) {
                return [
                    'date' => $snapshot->date->format('Y-m-d'),
                    'label' => $snapshot->date->format('d/m'),
                    'cost_value' => $snapshot->metrics['cost_value'] ?? 0,
                    'retail_value' => $snapshot->metrics['retail_value'] ?? 0,
                    'units' => $snapshot->metrics['units'] ?? 0,
                ];
            })->values()->toArray();
        });
    }

    /**
     * Calculate inventory turnover ratios.
     */
    public function getInventoryTurnover(Carbon $startDate, Carbon $endDate): array
    {
        $cacheKey = "inventory_turnover_{$startDate->format('Y-m-d')}_{$endDate->format('Y-m-d')}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($startDate, $endDate) {
            // Cost of goods sold in period
            $cogs = BillItem::whereHas('bill', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('created_at', [$startDate, $endDate->endOfDay()])
                    ->whereIn('status', ['completed', 'paid']);
            })
                ->join('products', 'bill_items.product_id', '=', 'products.id')
                ->sum(DB::raw('bill_items.quantity * products.purchase_price'));

            // Average inventory value (current as approximation)
            $currentValue = Product::sum(DB::raw('quantity * purchase_price'));

            // Turnover ratio
            $turnoverRatio = $currentValue > 0 ? $cogs / $currentValue : 0;
            $daysInInventory = $turnoverRatio > 0 ? 365 / $turnoverRatio : 999;

            // Per-product turnover
            $productTurnover = BillItem::whereHas('bill', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('created_at', [$startDate, $endDate->endOfDay()])
                    ->whereIn('status', ['completed', 'paid']);
            })
                ->select(
                    'product_id',
                    DB::raw('SUM(quantity) as sold_qty')
                )
                ->groupBy('product_id')
                ->get()
                ->keyBy('product_id');

            $products = Product::select('id', 'name', 'sku', 'category_id', 'quantity', 'purchase_price')
                ->with('category:id,name')
                ->get()
                ->map(function ($product) use ($productTurnover) {
                    $soldQty = $productTurnover[$product->id]->sold_qty ?? 0;
                    $avgStock = $product->quantity + ($soldQty / 2); // Rough average
                    $turnover = $avgStock > 0 ? $soldQty / $avgStock : 0;

                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'sku' => $product->sku,
                        'category' => $product->category?->name,
                        'current_stock' => $product->quantity,
                        'sold_qty' => (float) $soldQty,
                        'turnover_ratio' => round($turnover, 2),
                        'stock_value' => round($product->quantity * $product->purchase_price, 2),
                    ];
                })
                ->sortByDesc('turnover_ratio')
                ->values();

            return [
                'summary' => [
                    'cogs' => round($cogs, 2),
                    'avg_inventory' => round($currentValue, 2),
                    'turnover_ratio' => round($turnoverRatio, 2),
                    'days_in_inventory' => round($daysInInventory, 0),
                ],
                'by_product' => $products->take(50)->toArray(),
            ];
        });
    }

    /**
     * Detect dead stock (no sales in N days).
     */
    public function getDeadStock(int $noSalesDays = 60): array
    {
        $cacheKey = "dead_stock_{$noSalesDays}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($noSalesDays) {
            $cutoffDate = now()->subDays($noSalesDays);

            // Products with recent sales
            $productsSold = BillItem::whereHas('bill', function ($q) use ($cutoffDate) {
                $q->where('created_at', '>=', $cutoffDate)
                    ->whereIn('status', ['completed', 'paid']);
            })
                ->distinct()
                ->pluck('product_id');

            // Products with stock but no recent sales
            $deadStock = Product::where('quantity', '>', 0)
                ->whereNotIn('id', $productsSold)
                ->select('id', 'name', 'sku', 'category_id', 'quantity', 'purchase_price', 'updated_at')
                ->with('category:id,name')
                ->get()
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'sku' => $product->sku,
                        'category' => $product->category?->name,
                        'quantity' => $product->quantity,
                        'value' => round($product->quantity * $product->purchase_price, 2),
                        'last_activity' => $product->updated_at?->format('Y-m-d'),
                    ];
                })
                ->sortByDesc('value')
                ->values();

            $totalValue = $deadStock->sum('value');
            $totalUnits = $deadStock->sum('quantity');

            return [
                'summary' => [
                    'product_count' => $deadStock->count(),
                    'total_units' => $totalUnits,
                    'total_value' => round($totalValue, 2),
                    'threshold_days' => $noSalesDays,
                ],
                'products' => $deadStock->take(50)->toArray(),
            ];
        });
    }

    /**
     * Get stock movement analysis.
     */
    public function getStockMovements(Carbon $startDate, Carbon $endDate, ?int $productId = null): array
    {
        $cacheKey = "stock_movements_{$startDate->format('Y-m-d')}_{$endDate->format('Y-m-d')}_{$productId}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($startDate, $endDate, $productId) {
            $query = InventoryMovement::whereBetween('created_at', [$startDate, $endDate->endOfDay()])
                ->with(['product:id,name,sku', 'user:id,name']);

            if ($productId) {
                $query->where('product_id', $productId);
            }

            // Summary by type
            $byType = (clone $query)
                ->select(
                    'type',
                    DB::raw('COUNT(*) as count'),
                    DB::raw('SUM(ABS(quantity)) as total_qty')
                )
                ->groupBy('type')
                ->get();

            // Recent movements
            $movements = $query->orderByDesc('created_at')
                ->limit(100)
                ->get()
                ->map(function ($m) {
                    return [
                        'id' => $m->id,
                        'product_id' => $m->product_id,
                        'product_name' => $m->product?->name,
                        'product_sku' => $m->product?->sku,
                        'type' => $m->type,
                        'quantity' => $m->quantity,
                        'before' => $m->quantity_before,
                        'after' => $m->quantity_after,
                        'reason' => $m->reason,
                        'user' => $m->user?->name,
                        'created_at' => $m->created_at->format('Y-m-d H:i'),
                    ];
                });

            return [
                'by_type' => $byType,
                'movements' => $movements,
            ];
        });
    }

    /**
     * Get low stock alerts.
     */
    public function getLowStockAlerts(): array
    {
        return Cache::remember('low_stock_alerts', $this->cacheTtl, function () {
            return Product::whereColumn('quantity', '<=', 'min_stock')
                ->where('min_stock', '>', 0)
                ->select('id', 'name', 'sku', 'category_id', 'quantity', 'min_stock', 'purchase_price')
                ->with('category:id,name')
                ->orderBy(DB::raw('quantity / min_stock'))
                ->get()
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'sku' => $product->sku,
                        'category' => $product->category?->name,
                        'quantity' => $product->quantity,
                        'min_stock' => $product->min_stock,
                        'shortage' => $product->min_stock - $product->quantity,
                        'stock_percentage' => round(($product->quantity / $product->min_stock) * 100, 0),
                    ];
                })
                ->values()
                ->toArray();
        });
    }

    /**
     * Save daily inventory snapshot.
     */
    public function saveDailySnapshot(Carbon $date): void
    {
        $valuation = $this->getCurrentValuation();

        $metrics = [
            'cost_value' => $valuation['summary']['total_cost_value'],
            'retail_value' => $valuation['summary']['total_retail_value'],
            'units' => $valuation['summary']['total_units'],
            'skus' => $valuation['summary']['total_skus'],
            'by_category' => $valuation['by_category'],
        ];

        AnalyticsSnapshot::upsert(
            $date->format('Y-m-d'),
            AnalyticsSnapshot::TYPE_INVENTORY_VALUATION,
            $metrics
        );
    }
}
