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
            'dailyRevenue' => $this->salesService->getDailyRevenue($startDate, $endDate),
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

        $turnoverData = $this->inventoryService->getInventoryTurnover($startDate, $endDate);
        $deadStockData = $this->inventoryService->getDeadStock(90);

        return Inertia::render('Analytics/Inventory', [
            'valuation' => $this->inventoryService->getCurrentValuation(),
            'valuationHistory' => $this->inventoryService->getValuationHistory($startDate->diffInDays($endDate)),
            'turnover' => $turnoverData['by_product'] ?? [],
            'deadStock' => $deadStockData['products'] ?? [],
            'movements' => $this->inventoryService->getStockMovements($startDate, $endDate),
            'lowStockAlerts' => $this->inventoryService->getLowStockAlerts(),
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Export analytics data as CSV
     */
    public function export(Request $request)
    {
        $type = $request->input('type', 'sales');
        $startDate = $request->date('start_date') ?? now()->subDays(30);
        $endDate = $request->date('end_date') ?? now();

        $filename = "{$type}_export_" . now()->format('Y-m-d_His') . ".csv";

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($type, $startDate, $endDate) {
            $handle = fopen('php://output', 'w');
            
            // Add BOM for Excel UTF-8 compatibility
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            if ($type === 'inventory') {
                // Header row
                fputcsv($handle, ['Produit', 'SKU', 'Catégorie', 'Stock actuel', 'Prix achat', 'Prix vente', 'Valeur stock', 'Valeur vente']);
                
                $products = \App\Models\Product::with('category:id,name')
                    ->select('name', 'sku', 'category_id', 'quantity', 'purchase_price', 'selling_price')
                    ->get();

                foreach ($products as $product) {
                    fputcsv($handle, [
                        $product->name,
                        $product->sku,
                        $product->category?->name ?? 'Non catégorisé',
                        $product->quantity,
                        number_format($product->purchase_price, 2, ',', ' '),
                        number_format($product->selling_price, 2, ',', ' '),
                        number_format($product->quantity * $product->purchase_price, 2, ',', ' '),
                        number_format($product->quantity * $product->selling_price, 2, ',', ' '),
                    ]);
                }
            } elseif ($type === 'sales') {
                // Header row
                fputcsv($handle, ['Date', 'N° Facture', 'Client', 'Mode paiement', 'Montant', 'Articles']);
                
                $bills = \App\Models\Bill::whereBetween('created_at', [$startDate, $endDate->endOfDay()])
                    ->whereIn('status', ['completed', 'paid'])
                    ->with('items')
                    ->orderBy('created_at', 'desc')
                    ->get();

                foreach ($bills as $bill) {
                    fputcsv($handle, [
                        $bill->created_at->format('d/m/Y H:i'),
                        $bill->bill_number ?? $bill->id,
                        $bill->customer_name ?? 'Client comptoir',
                        $bill->payment_method,
                        number_format($bill->total, 2, ',', ' '),
                        $bill->items->count(),
                    ]);
                }
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
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
