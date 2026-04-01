<?php

namespace App\Services\Analytics;

use App\Models\Bill;
use App\Models\BillItem;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\AnalyticsSnapshot;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SalesAnalyticsService
{
    protected int $cacheTtl = 300; // 5 minutes

    /**
     * Get main KPIs for the given period.
     */
    public function getKPIs(Carbon $startDate, Carbon $endDate, ?int $cashierId = null): array
    {
        $cacheKey = "sales_kpis_{$startDate->format('Y-m-d')}_{$endDate->format('Y-m-d')}_{$cashierId}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($startDate, $endDate, $cashierId) {
            $query = Bill::whereBetween('created_at', [$startDate, $endDate->endOfDay()]);

            if ($cashierId) {
                $query->where('user_id', $cashierId);
            }

            $completedQuery = (clone $query)->whereIn('status', ['completed', 'paid']);
            $cancelledQuery = (clone $query)->where('status', 'cancelled');

            $totalRevenue = $completedQuery->sum('total');
            $totalOrders = $completedQuery->count();
            $avgBasket = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;
            $cancelledCount = $cancelledQuery->count();
            $cancelledValue = $cancelledQuery->sum('total');

            // Previous period for comparison
            $periodLength = $startDate->diffInDays($endDate) + 1;
            $prevStart = $startDate->copy()->subDays($periodLength);
            $prevEnd = $startDate->copy()->subDay();

            $prevQuery = Bill::whereBetween('created_at', [$prevStart, $prevEnd->endOfDay()])
                ->whereIn('status', ['completed', 'paid']);

            if ($cashierId) {
                $prevQuery->where('user_id', $cashierId);
            }

            $prevRevenue = $prevQuery->sum('total');
            $prevOrders = $prevQuery->count();
            $prevAvgBasket = $prevOrders > 0 ? $prevRevenue / $prevOrders : 0;

            return [
                'revenue' => [
                    'value' => round($totalRevenue, 2),
                    'previous' => round($prevRevenue, 2),
                    'change' => $this->calculateChange($totalRevenue, $prevRevenue),
                ],
                'orders' => [
                    'value' => $totalOrders,
                    'previous' => $prevOrders,
                    'change' => $this->calculateChange($totalOrders, $prevOrders),
                ],
                'avg_basket' => [
                    'value' => round($avgBasket, 2),
                    'previous' => round($prevAvgBasket, 2),
                    'change' => $this->calculateChange($avgBasket, $prevAvgBasket),
                ],
                'cancellations' => [
                    'count' => $cancelledCount,
                    'value' => round($cancelledValue, 2),
                ],
            ];
        });
    }

    /**
     * Get daily revenue chart data.
     */
    public function getDailyRevenue(Carbon $startDate, Carbon $endDate, ?int $cashierId = null): array
    {
        $cacheKey = "daily_revenue_{$startDate->format('Y-m-d')}_{$endDate->format('Y-m-d')}_{$cashierId}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($startDate, $endDate, $cashierId) {
            $query = Bill::whereBetween('created_at', [$startDate, $endDate->endOfDay()])
                ->whereIn('status', ['completed', 'paid'])
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('SUM(total) as revenue'),
                    DB::raw('COUNT(*) as orders')
                )
                ->groupBy('date')
                ->orderBy('date');

            if ($cashierId) {
                $query->where('user_id', $cashierId);
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
        });
    }

    /**
     * Get payment method distribution.
     */
    public function getPaymentMethodSplit(Carbon $startDate, Carbon $endDate): array
    {
        $cacheKey = "payment_split_{$startDate->format('Y-m-d')}_{$endDate->format('Y-m-d')}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($startDate, $endDate) {
            $data = Bill::whereBetween('created_at', [$startDate, $endDate->endOfDay()])
                ->whereIn('status', ['completed', 'paid'])
                ->select(
                    'payment_method',
                    DB::raw('COUNT(*) as count'),
                    DB::raw('SUM(total) as total')
                )
                ->groupBy('payment_method')
                ->get();

            $total = $data->sum('total');
            $labels = [
                'cash' => __('Espèces'),
                'card' => __('Carte'),
                'check' => __('Chèque'),
                'transfer' => __('Virement'),
                'credit' => __('Crédit'),
            ];

            return $data->map(function ($item) use ($total, $labels) {
                return [
                    'method' => $item->payment_method,
                    'label' => $labels[$item->payment_method] ?? $item->payment_method,
                    'count' => $item->count,
                    'total' => round($item->total, 2),
                    'percentage' => $total > 0 ? round(($item->total / $total) * 100, 1) : 0,
                ];
            })->values()->toArray();
        });
    }

    /**
     * Get top products (Pareto analysis).
     */
    public function getTopProducts(Carbon $startDate, Carbon $endDate, int $limit = 20): array
    {
        $cacheKey = "top_products_{$startDate->format('Y-m-d')}_{$endDate->format('Y-m-d')}_{$limit}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($startDate, $endDate, $limit) {
            $data = BillItem::whereHas('bill', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('created_at', [$startDate, $endDate->endOfDay()])
                    ->whereIn('status', ['completed', 'paid']);
            })
                ->select(
                    'product_id',
                    DB::raw('SUM(quantity) as total_qty'),
                    DB::raw('SUM(total) as total_revenue')
                )
                ->groupBy('product_id')
                ->orderByDesc('total_revenue')
                ->limit($limit)
                ->with('product:id,name,sku')
                ->get();

            $grandTotal = $data->sum('total_revenue');
            $cumulative = 0;

            return $data->map(function ($item) use ($grandTotal, &$cumulative) {
                $percentage = $grandTotal > 0 ? ($item->total_revenue / $grandTotal) * 100 : 0;
                $cumulative += $percentage;

                return [
                    'product_id' => $item->product_id,
                    'name' => $item->product?->name ?? 'N/A',
                    'sku' => $item->product?->sku ?? 'N/A',
                    'quantity' => (float) $item->total_qty,
                    'revenue' => round($item->total_revenue, 2),
                    'percentage' => round($percentage, 1),
                    'cumulative' => round($cumulative, 1),
                ];
            })->values()->toArray();
        });
    }

    /**
     * Get category performance.
     */
    public function getCategoryPerformance(Carbon $startDate, Carbon $endDate): array
    {
        $cacheKey = "category_perf_{$startDate->format('Y-m-d')}_{$endDate->format('Y-m-d')}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($startDate, $endDate) {
            $data = BillItem::whereHas('bill', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('created_at', [$startDate, $endDate->endOfDay()])
                    ->whereIn('status', ['completed', 'paid']);
            })
                ->join('products', 'bill_items.product_id', '=', 'products.id')
                ->join('categories', 'products.category_id', '=', 'categories.id')
                ->select(
                    'categories.id',
                    'categories.name',
                    DB::raw('SUM(bill_items.quantity) as total_qty'),
                    DB::raw('SUM(bill_items.total) as total_revenue'),
                    DB::raw('COUNT(DISTINCT bill_items.bill_id) as order_count')
                )
                ->groupBy('categories.id', 'categories.name')
                ->orderByDesc('total_revenue')
                ->get();

            $grandTotal = $data->sum('total_revenue');

            return $data->map(function ($item) use ($grandTotal) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'color' => $item->color ?? '#666666',
                    'quantity' => (float) $item->total_qty,
                    'revenue' => round($item->total_revenue, 2),
                    'orders' => $item->order_count,
                    'percentage' => $grandTotal > 0 ? round(($item->total_revenue / $grandTotal) * 100, 1) : 0,
                ];
            })->values()->toArray();
        });
    }

    /**
     * Get hourly sales distribution.
     */
    public function getHourlySales(Carbon $startDate, Carbon $endDate): array
    {
        $cacheKey = "hourly_sales_{$startDate->format('Y-m-d')}_{$endDate->format('Y-m-d')}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($startDate, $endDate) {
            $data = Bill::whereBetween('created_at', [$startDate, $endDate->endOfDay()])
                ->whereIn('status', ['completed', 'paid'])
                ->select(
                    DB::raw('HOUR(created_at) as hour'),
                    DB::raw('COUNT(*) as count'),
                    DB::raw('SUM(total) as total')
                )
                ->groupBy('hour')
                ->get()
                ->keyBy('hour');

            $result = [];
            for ($h = 0; $h < 24; $h++) {
                $result[] = [
                    'hour' => $h,
                    'label' => sprintf('%02d:00', $h),
                    'count' => (int) ($data[$h]->count ?? 0),
                    'total' => round($data[$h]->total ?? 0, 2),
                ];
            }

            return $result;
        });
    }

    /**
     * Get cashier performance.
     */
    public function getCashierPerformance(Carbon $startDate, Carbon $endDate): array
    {
        $cacheKey = "cashier_perf_{$startDate->format('Y-m-d')}_{$endDate->format('Y-m-d')}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($startDate, $endDate) {
            return Bill::whereBetween('created_at', [$startDate, $endDate->endOfDay()])
                ->whereIn('status', ['completed', 'paid'])
                ->select(
                    'user_id',
                    DB::raw('COUNT(*) as order_count'),
                    DB::raw('SUM(total) as total_revenue'),
                    DB::raw('AVG(total) as avg_ticket')
                )
                ->groupBy('user_id')
                ->with('user:id,name')
                ->orderByDesc('total_revenue')
                ->get()
                ->map(function ($item) {
                    return [
                        'user_id' => $item->user_id,
                        'name' => $item->user?->name ?? 'N/A',
                        'orders' => $item->order_count,
                        'revenue' => round($item->total_revenue, 2),
                        'avg_ticket' => round($item->avg_ticket, 2),
                    ];
                })
                ->values()
                ->toArray();
        });
    }

    /**
     * Get sales table with filters.
     */
    public function getSalesTable(
        Carbon $startDate,
        Carbon $endDate,
        ?int $cashierId = null,
        ?string $paymentMethod = null,
        ?string $status = null,
        int $page = 1,
        int $perPage = 20
    ): array {
        $query = Bill::whereBetween('created_at', [$startDate, $endDate->endOfDay()])
            ->with(['user:id,name', 'worker:id,name']);

        if ($cashierId) {
            $query->where('user_id', $cashierId);
        }

        if ($paymentMethod) {
            $query->where('payment_method', $paymentMethod);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $total = $query->count();
        $data = $query->orderByDesc('created_at')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return [
            'data' => $data,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'last_page' => ceil($total / $perPage),
        ];
    }

    /**
     * Save daily snapshot for historical tracking.
     */
    public function saveDailySnapshot(Carbon $date): void
    {
        $start = $date->copy()->startOfDay();
        $end = $date->copy()->endOfDay();

        $metrics = [
            'kpis' => $this->getKPIs($start, $end),
            'payment_split' => $this->getPaymentMethodSplit($start, $end),
            'hourly' => $this->getHourlySales($start, $end),
        ];

        AnalyticsSnapshot::upsert(
            $date->format('Y-m-d'),
            AnalyticsSnapshot::TYPE_DAILY_SALES,
            $metrics
        );
    }

    protected function calculateChange(float $current, float $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
