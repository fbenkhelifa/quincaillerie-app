<?php

namespace App\Http\Controllers;

use App\Jobs\ComputeDailyAnalyticsJob;
use App\Jobs\DetectAnomaliesJob;
use App\Services\Analytics\InventoryAnalyticsService;
use App\Services\Analytics\SalesAnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function __construct(
        private SalesAnalyticsService $salesService,
        private InventoryAnalyticsService $inventoryService
    ) {}

    /**
     * Sales Analytics Dashboard
     */
    public function sales(Request $request): Response
    {
        $startDate = $request->date('start_date') ?? now()->subDays(30);
        $endDate = $request->date('end_date') ?? now();
        $period = $request->input('period', 'daily'); // daily, weekly, monthly

        return Inertia::render('Analytics/Sales', [
            'kpis' => $this->salesService->getKPIs($startDate, $endDate),
            'dailyRevenue' => $this->salesService->getDailyRevenue($startDate, $endDate, $period),
            'paymentMethods' => $this->salesService->getPaymentMethodSplit($startDate, $endDate),
            'topProducts' => $this->salesService->getTopProducts($startDate, $endDate, 10),
            'categoryPerformance' => $this->salesService->getCategoryPerformance($startDate, $endDate),
            'hourlySales' => $this->salesService->getHourlySales($startDate, $endDate),
            'cashierPerformance' => $this->salesService->getCashierPerformance($startDate, $endDate),
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'period' => $period,
            ],
        ]);
    }

    /**
     * Sales table with server-side filtering
     */
    public function salesTable(Request $request)
    {
        $startDate = $request->date('start_date') ?? now()->subDays(30);
        $endDate = $request->date('end_date') ?? now();
        
        $data = $this->salesService->getSalesTable(
            startDate: $startDate,
            endDate: $endDate,
            paymentMethod: $request->input('payment_method'),
            cashierId: $request->input('cashier_id'),
            minAmount: $request->input('min_amount'),
            maxAmount: $request->input('max_amount'),
            page: $request->integer('page', 1),
            perPage: $request->integer('per_page', 25)
        );

        return response()->json($data);
    }

    /**
     * Inventory Analytics Dashboard
     */
    public function inventory(Request $request): Response
    {
        $startDate = $request->date('start_date') ?? now()->subDays(90);
        $endDate = $request->date('end_date') ?? now();

        return Inertia::render('Analytics/Inventory', [
            'valuation' => $this->inventoryService->getCurrentValuation(),
            'valuationHistory' => $this->inventoryService->getValuationHistory($startDate, $endDate),
            'turnover' => $this->inventoryService->getInventoryTurnover($startDate, $endDate, 20),
            'deadStock' => $this->inventoryService->getDeadStock(90, 50),
            'movements' => $this->inventoryService->getStockMovements($startDate, $endDate),
            'lowStockAlerts' => $this->inventoryService->getLowStockAlerts(30),
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Export analytics data
     */
    public function export(Request $request)
    {
        $type = $request->input('type', 'sales');
        $format = $request->input('format', 'csv');
        $startDate = $request->date('start_date') ?? now()->subDays(30);
        $endDate = $request->date('end_date') ?? now();

        // Implementation for CSV/Excel export would go here
        // For now, return JSON
        $data = match ($type) {
            'sales' => [
                'kpis' => $this->salesService->getKPIs($startDate, $endDate),
                'daily' => $this->salesService->getDailyRevenue($startDate, $endDate),
            ],
            'inventory' => [
                'valuation' => $this->inventoryService->getCurrentValuation(),
                'turnover' => $this->inventoryService->getInventoryTurnover($startDate, $endDate),
            ],
            default => [],
        };

        return response()->json($data);
    }

    /**
     * Trigger manual analytics refresh
     */
    public function refresh(Request $request)
    {
        $type = $request->input('type', 'all');

        if ($type === 'all' || $type === 'analytics') {
            ComputeDailyAnalyticsJob::dispatch(now());
        }

        if ($type === 'all' || $type === 'anomalies') {
            DetectAnomaliesJob::dispatch();
        }

        return response()->json([
            'message' => 'Actualisation lancée en arrière-plan',
            'type' => $type,
        ]);
    }
}
