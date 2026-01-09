<?php

namespace App\Services;

use App\Models\AnomalyFinding;
use App\Models\Bill;
use App\Models\BillItem;
use App\Models\Category;
use App\Models\InventoryMovement;
use App\Models\Notification;
use App\Models\Product;
use App\Models\ReorderSuggestion;
use App\Models\Worker;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardAnalyticsService
{
    protected int $cacheTtl = 600; // 10 minutes

    /**
     * Get all dashboard data with filters.
     */
    public function getDashboardData(array $filters): array
    {
        $cacheKey = $this->buildCacheKey('dashboard', $filters);

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($filters) {
            $startDate = Carbon::parse($filters['start_date'] ?? now()->subDays(30));
            $endDate = Carbon::parse($filters['end_date'] ?? now());
            $workerId = $filters['worker_id'] ?? null;
            $paymentMethod = $filters['payment_method'] ?? null;
            $categoryId = $filters['category_id'] ?? null;

            return [
                'kpis' => $this->getKPIs($startDate, $endDate, $workerId, $paymentMethod, $categoryId),
                'charts' => [
                    'revenue_timeline' => $this->getRevenueTimeline($startDate, $endDate, $workerId, $paymentMethod, $categoryId),
                    'payment_methods' => $this->getPaymentMethodsChart($startDate, $endDate, $workerId, $categoryId),
                    'top_products' => $this->getTopProductsChart($startDate, $endDate, $categoryId, 10),
                    'stock_risk' => $this->getStockRiskChart(),
                    'movements_timeline' => $this->getMovementsTimeline($startDate, $endDate),
                    'alerts_by_severity' => $this->getAlertsBySeverity($startDate, $endDate),
                ],
                'recommended_actions' => [
                    'reorder_suggestions' => $this->getTopReorderSuggestions(10),
                    'alerts' => $this->getTopAlerts(5),
                    'dead_stock' => $this->getDeadStock(90, 10),
                ],
                'meta' => [
                    'last_updated' => now()->toIso8601String(),
                    'cache_ttl_minutes' => $this->cacheTtl / 60,
                ],
            ];
        });
    }

    /**
     * Get KPIs with trend comparisons.
     */
    public function getKPIs(
        Carbon $startDate,
        Carbon $endDate,
        ?int $workerId = null,
        ?string $paymentMethod = null,
        ?int $categoryId = null
    ): array {
        // Current period
        $current = $this->getPeriodMetrics($startDate, $endDate, $workerId, $paymentMethod, $categoryId);

        // Previous period for comparison
        $periodDays = $startDate->diffInDays($endDate) + 1;
        $prevStart = $startDate->copy()->subDays($periodDays);
        $prevEnd = $startDate->copy()->subDay();
        $previous = $this->getPeriodMetrics($prevStart, $prevEnd, $workerId, $paymentMethod, $categoryId);

        // Stock metrics (not period-dependent)
        $stockMetrics = $this->getStockMetrics();

        // Alerts count
        $alertsCount = AnomalyFinding::where('status', 'new')
            ->where('severity', 'high')
            ->count();

        return [
            'revenue' => [
                'value' => $current['revenue'],
                'previous' => $previous['revenue'],
                'change' => $this->calculateChange($current['revenue'], $previous['revenue']),
                'label' => 'Chiffre d\'affaires',
                'format' => 'currency',
            ],
            'orders' => [
                'value' => $current['orders'],
                'previous' => $previous['orders'],
                'change' => $this->calculateChange($current['orders'], $previous['orders']),
                'label' => 'Commandes',
                'format' => 'number',
            ],
            'avg_basket' => [
                'value' => $current['avg_basket'],
                'previous' => $previous['avg_basket'],
                'change' => $this->calculateChange($current['avg_basket'], $previous['avg_basket']),
                'label' => 'Panier moyen',
                'format' => 'currency',
            ],
            'gross_profit' => [
                'value' => $current['gross_profit'],
                'previous' => $previous['gross_profit'],
                'change' => $this->calculateChange($current['gross_profit'], $previous['gross_profit']),
                'label' => 'Marge brute',
                'format' => 'currency',
            ],
            'stockout_risk' => [
                'value' => $stockMetrics['stockout_risk'],
                'previous' => null,
                'change' => null,
                'label' => 'Risque rupture',
                'format' => 'number',
            ],
            'alerts' => [
                'value' => $alertsCount,
                'previous' => null,
                'change' => null,
                'label' => 'Alertes critiques',
                'format' => 'number',
            ],
        ];
    }

    /**
     * Get period metrics.
     */
    protected function getPeriodMetrics(
        Carbon $startDate,
        Carbon $endDate,
        ?int $workerId,
        ?string $paymentMethod,
        ?int $categoryId
    ): array {
        $query = Bill::whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->whereIn('status', ['completed', 'paid']);

        if ($workerId) {
            $query->where('worker_id', $workerId);
        }
        if ($paymentMethod) {
            $query->where('payment_method', $paymentMethod);
        }

        // If category filter, need to join bill_items
        if ($categoryId) {
            $billIds = BillItem::whereHas('product', fn($q) => $q->where('category_id', $categoryId))
                ->whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
                ->pluck('bill_id')
                ->unique();
            $query->whereIn('id', $billIds);
        }

        $revenue = $query->sum('total');
        $orders = $query->count();
        $avgBasket = $orders > 0 ? $revenue / $orders : 0;

        // Calculate gross profit from bill items
        $grossProfit = $this->calculateGrossProfit($startDate, $endDate, $workerId, $paymentMethod, $categoryId);

        return [
            'revenue' => round($revenue, 2),
            'orders' => $orders,
            'avg_basket' => round($avgBasket, 2),
            'gross_profit' => round($grossProfit, 2),
        ];
    }

    /**
     * Calculate gross profit (revenue - cost).
     */
    protected function calculateGrossProfit(
        Carbon $startDate,
        Carbon $endDate,
        ?int $workerId,
        ?string $paymentMethod,
        ?int $categoryId
    ): float {
        $query = BillItem::query()
            ->join('bills', 'bill_items.bill_id', '=', 'bills.id')
            ->join('products', 'bill_items.product_id', '=', 'products.id')
            ->whereBetween('bills.created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->whereIn('bills.status', ['completed', 'paid']);

        if ($workerId) {
            $query->where('bills.worker_id', $workerId);
        }
        if ($paymentMethod) {
            $query->where('bills.payment_method', $paymentMethod);
        }
        if ($categoryId) {
            $query->where('products.category_id', $categoryId);
        }

        $revenue = $query->sum(DB::raw('bill_items.quantity * bill_items.unit_price'));
        $cost = $query->sum(DB::raw('bill_items.quantity * products.purchase_price'));

        return $revenue - $cost;
    }

    /**
     * Get stock metrics.
     */
    protected function getStockMetrics(): array
    {
        $lowStock = Product::whereColumn('quantity', '<=', 'min_stock')
            ->where('quantity', '>', 0)
            ->where('min_stock', '>', 0)
            ->count();

        $outOfStock = Product::where('quantity', '<=', 0)->count();

        // Check reorder suggestions for predicted stockouts
        $predictedStockouts = ReorderSuggestion::whereIn('urgency', ['critical', 'high'])
            ->where('status', 'pending')
            ->count();

        return [
            'low_stock' => $lowStock,
            'out_of_stock' => $outOfStock,
            'stockout_risk' => $lowStock + $outOfStock + $predictedStockouts,
        ];
    }

    /**
     * Get revenue timeline chart data.
     */
    public function getRevenueTimeline(
        Carbon $startDate,
        Carbon $endDate,
        ?int $workerId,
        ?string $paymentMethod,
        ?int $categoryId
    ): array {
        $query = Bill::whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->whereIn('status', ['completed', 'paid'])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date');

        if ($workerId) {
            $query->where('worker_id', $workerId);
        }
        if ($paymentMethod) {
            $query->where('payment_method', $paymentMethod);
        }

        $data = $query->get()->keyBy('date');

        // Fill missing dates
        $result = [];
        $current = $startDate->copy();
        while ($current <= $endDate) {
            $dateStr = $current->format('Y-m-d');
            $result[] = [
                'date' => $dateStr,
                'label' => $current->format('d/m'),
                'revenue' => (float) ($data[$dateStr]->revenue ?? 0),
                'orders' => (int) ($data[$dateStr]->orders ?? 0),
            ];
            $current->addDay();
        }

        return $result;
    }

    /**
     * Get payment methods chart data.
     */
    public function getPaymentMethodsChart(
        Carbon $startDate,
        Carbon $endDate,
        ?int $workerId,
        ?int $categoryId
    ): array {
        $query = Bill::whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->whereIn('status', ['completed', 'paid'])
            ->select(
                'payment_method',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(total) as total')
            )
            ->groupBy('payment_method');

        if ($workerId) {
            $query->where('worker_id', $workerId);
        }

        $data = $query->get();
        $total = $data->sum('total');

        $labels = [
            'cash' => 'Espèces',
            'card' => 'Carte',
            'check' => 'Chèque',
            'transfer' => 'Virement',
            'credit' => 'Crédit',
        ];

        $colors = [
            'cash' => '#4caf50',
            'card' => '#2196f3',
            'check' => '#ff9800',
            'transfer' => '#9c27b0',
            'credit' => '#f44336',
        ];

        return $data->map(fn($row) => [
            'name' => $labels[$row->payment_method] ?? $row->payment_method,
            'value' => round($row->total, 2),
            'count' => $row->count,
            'percentage' => $total > 0 ? round(($row->total / $total) * 100, 1) : 0,
            'color' => $colors[$row->payment_method] ?? '#757575',
        ])->values()->all();
    }

    /**
     * Get top products by revenue.
     */
    public function getTopProductsChart(
        Carbon $startDate,
        Carbon $endDate,
        ?int $categoryId,
        int $limit = 10
    ): array {
        $query = BillItem::query()
            ->join('bills', 'bill_items.bill_id', '=', 'bills.id')
            ->join('products', 'bill_items.product_id', '=', 'products.id')
            ->whereBetween('bills.created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->whereIn('bills.status', ['completed', 'paid'])
            ->select(
                'products.id',
                'products.name',
                DB::raw('SUM(bill_items.total) as revenue'),
                DB::raw('SUM(bill_items.quantity) as quantity_sold')
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('revenue')
            ->limit($limit);

        if ($categoryId) {
            $query->where('products.category_id', $categoryId);
        }

        $data = $query->get();
        $totalRevenue = $data->sum('revenue');
        $cumulativePercentage = 0;

        return $data->map(function ($row) use ($totalRevenue, &$cumulativePercentage) {
            $percentage = $totalRevenue > 0 ? ($row->revenue / $totalRevenue) * 100 : 0;
            $cumulativePercentage += $percentage;

            return [
                'id' => $row->id,
                'name' => $row->name,
                'revenue' => round($row->revenue, 2),
                'quantity_sold' => round($row->quantity_sold, 2),
                'percentage' => round($percentage, 1),
                'cumulative_percentage' => round($cumulativePercentage, 1),
            ];
        })->values()->all();
    }

    /**
     * Get stock risk distribution.
     */
    public function getStockRiskChart(): array
    {
        $categories = Category::with(['products' => function ($query) {
            $query->where('is_active', true);
        }])->get();

        return $categories->map(function ($category) {
            $products = $category->products;
            $total = $products->count();
            $lowStock = $products->filter(fn($p) => $p->quantity <= $p->min_stock && $p->quantity > 0)->count();
            $outOfStock = $products->filter(fn($p) => $p->quantity <= 0)->count();
            $healthy = $total - $lowStock - $outOfStock;

            return [
                'name' => $category->name,
                'total' => $total,
                'healthy' => $healthy,
                'low_stock' => $lowStock,
                'out_of_stock' => $outOfStock,
            ];
        })->filter(fn($c) => $c['total'] > 0)->values()->all();
    }

    /**
     * Get inventory movements timeline.
     */
    public function getMovementsTimeline(Carbon $startDate, Carbon $endDate): array
    {
        $data = InventoryMovement::whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->select(
                DB::raw('DATE(created_at) as date'),
                'type',
                DB::raw('SUM(quantity_change) as total_change'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('date', 'type')
            ->orderBy('date')
            ->get();

        // Group by date
        $byDate = [];
        foreach ($data as $row) {
            $date = $row->date;
            if (!isset($byDate[$date])) {
                $byDate[$date] = [
                    'date' => $date,
                    'label' => Carbon::parse($date)->format('d/m'),
                    'sales' => 0,
                    'purchases' => 0,
                    'adjustments' => 0,
                    'returns' => 0,
                ];
            }
            $type = $row->type;
            $byDate[$date][$type === 'sale' ? 'sales' : ($type === 'purchase' ? 'purchases' : ($type === 'return' ? 'returns' : 'adjustments'))] += abs($row->total_change);
        }

        // Fill missing dates
        $result = [];
        $current = $startDate->copy();
        while ($current <= $endDate) {
            $dateStr = $current->format('Y-m-d');
            $result[] = $byDate[$dateStr] ?? [
                'date' => $dateStr,
                'label' => $current->format('d/m'),
                'sales' => 0,
                'purchases' => 0,
                'adjustments' => 0,
                'returns' => 0,
            ];
            $current->addDay();
        }

        return $result;
    }

    /**
     * Get alerts by severity.
     */
    public function getAlertsBySeverity(Carbon $startDate, Carbon $endDate): array
    {
        $data = AnomalyFinding::whereBetween('detected_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->select(
                DB::raw('DATE(detected_at) as date'),
                'severity',
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('date', 'severity')
            ->orderBy('date')
            ->get();

        // Group by date
        $byDate = [];
        foreach ($data as $row) {
            $date = $row->date;
            if (!isset($byDate[$date])) {
                $byDate[$date] = [
                    'date' => $date,
                    'label' => Carbon::parse($date)->format('d/m'),
                    'critical' => 0,
                    'high' => 0,
                    'medium' => 0,
                    'low' => 0,
                ];
            }
            $byDate[$date][$row->severity] = $row->count;
        }

        return array_values($byDate);
    }

    /**
     * Get top reorder suggestions.
     */
    public function getTopReorderSuggestions(int $limit = 10): array
    {
        return ReorderSuggestion::with(['product:id,name,sku,quantity,min_stock', 'suggestedSupplier:id,name'])
            ->where('status', 'pending')
            ->orderByRaw("FIELD(urgency, 'critical', 'high', 'medium', 'low')")
            ->orderByDesc('computed_at')
            ->limit($limit)
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'product_id' => $s->product_id,
                'product_name' => $s->product?->name,
                'product_sku' => $s->product?->sku,
                'current_stock' => $s->current_stock,
                'recommended_qty' => $s->recommended_qty,
                'urgency' => $s->urgency,
                'urgency_label' => $s->urgency_label,
                'urgency_color' => $s->urgency_color,
                'days_until_stockout' => $s->days_until_stockout,
                'supplier_name' => $s->suggestedSupplier?->name,
                'reason' => $s->reason_json['primary'] ?? null,
            ])
            ->all();
    }

    /**
     * Get top alerts.
     */
    public function getTopAlerts(int $limit = 5): array
    {
        return AnomalyFinding::where('status', 'new')
            ->orderByRaw("FIELD(severity, 'critical', 'high', 'medium', 'low')")
            ->orderByDesc('detected_at')
            ->limit($limit)
            ->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'type' => $a->type,
                'severity' => $a->severity,
                'title' => $a->title,
                'explanation' => $a->explanation,
                'impact_value' => $a->impact_value,
                'detected_at' => $a->detected_at?->format('Y-m-d H:i'),
            ])
            ->all();
    }

    /**
     * Get dead stock products.
     */
    public function getDeadStock(int $days = 90, int $limit = 10): array
    {
        $cutoffDate = now()->subDays($days);

        // Products with no sales in N days
        $productsWithRecentSales = BillItem::join('bills', 'bill_items.bill_id', '=', 'bills.id')
            ->where('bills.created_at', '>=', $cutoffDate)
            ->whereIn('bills.status', ['completed', 'paid'])
            ->pluck('bill_items.product_id')
            ->unique();

        return Product::whereNotIn('id', $productsWithRecentSales)
            ->where('quantity', '>', 0)
            ->where('is_active', true)
            ->orderByDesc(DB::raw('quantity * purchase_price'))
            ->limit($limit)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'sku' => $p->sku,
                'quantity' => $p->quantity,
                'stock_value' => round($p->quantity * $p->purchase_price, 2),
                'days_without_sale' => $days,
                'category' => $p->category?->name,
            ])
            ->all();
    }

    /**
     * Get filter options.
     */
    public function getFilterOptions(): array
    {
        return [
            'workers' => Worker::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'categories' => Category::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'payment_methods' => [
                ['value' => 'cash', 'label' => 'Espèces'],
                ['value' => 'card', 'label' => 'Carte'],
                ['value' => 'check', 'label' => 'Chèque'],
                ['value' => 'transfer', 'label' => 'Virement'],
                ['value' => 'credit', 'label' => 'Crédit'],
            ],
            'date_presets' => [
                ['value' => 'today', 'label' => 'Aujourd\'hui'],
                ['value' => '7d', 'label' => '7 derniers jours'],
                ['value' => '30d', 'label' => '30 derniers jours'],
                ['value' => '90d', 'label' => '90 derniers jours'],
                ['value' => 'mtd', 'label' => 'Ce mois'],
                ['value' => 'ytd', 'label' => 'Cette année'],
                ['value' => 'custom', 'label' => 'Personnalisé'],
            ],
        ];
    }

    /**
     * Build cache key from filters.
     */
    protected function buildCacheKey(string $prefix, array $filters): string
    {
        ksort($filters);
        return $prefix . '_' . md5(json_encode($filters));
    }

    /**
     * Calculate percentage change.
     */
    protected function calculateChange(float $current, float $previous): ?float
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : null;
        }
        return round((($current - $previous) / $previous) * 100, 1);
    }

    /**
     * Invalidate dashboard cache.
     */
    public static function invalidateCache(): void
    {
        // Clear specific keys (works with all cache drivers)
        Cache::forget('dashboard_filter_options');
        
        // Clear dashboard data keys with pattern
        $cacheKeys = Cache::get('dashboard_cache_keys', []);
        foreach ($cacheKeys as $key) {
            Cache::forget($key);
        }
        Cache::forget('dashboard_cache_keys');
    }
}
