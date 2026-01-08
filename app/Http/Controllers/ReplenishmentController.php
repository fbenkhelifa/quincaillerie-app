<?php

namespace App\Http\Controllers;

use App\Jobs\ComputeReorderSuggestionsJob;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\ReorderSuggestion;
use App\Models\Supplier;
use App\Services\Replenishment\DemandForecastingService;
use App\Services\Replenishment\ReorderCalculationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReplenishmentController extends Controller
{
    protected ReorderCalculationService $reorderService;
    protected DemandForecastingService $forecastService;

    public function __construct(
        ReorderCalculationService $reorderService,
        DemandForecastingService $forecastService
    ) {
        $this->reorderService = $reorderService;
        $this->forecastService = $forecastService;
    }

    /**
     * Show replenishment dashboard with suggestions.
     */
    public function index(Request $request)
    {
        $query = ReorderSuggestion::with(['product:id,name,sku,quantity,min_stock,image', 'suggestedSupplier:id,name'])
            ->pending();

        // Filters
        if ($request->filled('urgency')) {
            $query->where('urgency', $request->urgency);
        }

        if ($request->filled('supplier_id')) {
            $query->where('suggested_supplier_id', $request->supplier_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('product', fn($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%"));
        }

        if ($request->filled('min_confidence')) {
            $query->where('confidence', '>=', $request->min_confidence);
        }

        // Sort by urgency priority, then stockout date
        $suggestions = $query
            ->orderByRaw("FIELD(urgency, 'critical', 'high', 'medium', 'low')")
            ->orderBy('projected_stockout_date')
            ->paginate(20)
            ->withQueryString();

        // Stats for header
        $stats = [
            'total_pending' => ReorderSuggestion::pending()->count(),
            'critical' => ReorderSuggestion::pending()->critical()->count(),
            'high_priority' => ReorderSuggestion::pending()->highPriority()->count(),
            'total_value' => ReorderSuggestion::pending()
                ->join('products', 'products.id', '=', 'reorder_suggestions.product_id')
                ->selectRaw('SUM(recommended_qty * products.purchase_price) as total')
                ->value('total') ?? 0,
        ];

        return Inertia::render('Replenishment/Index', [
            'suggestions' => $suggestions,
            'suppliers' => Supplier::active()->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['urgency', 'supplier_id', 'search', 'min_confidence']),
            'stats' => $stats,
        ]);
    }

    /**
     * Get detailed forecast data for a single product (for charts).
     */
    public function productForecast(Product $product)
    {
        $forecast = $this->forecastService->forecastDemand($product, 30, 90);
        $seasonality = $this->forecastService->detectSeasonality(
            $this->forecastService->getSalesHistory($product, 90)
        );

        // Get existing suggestion if any
        $suggestion = ReorderSuggestion::where('product_id', $product->id)
            ->pending()
            ->first();

        return response()->json([
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'current_stock' => $product->quantity,
                'min_stock' => $product->min_stock,
            ],
            'forecast' => $forecast,
            'seasonality' => $seasonality,
            'suggestion' => $suggestion ? [
                'id' => $suggestion->id,
                'recommended_qty' => $suggestion->recommended_qty,
                'reorder_point' => $suggestion->reorder_point,
                'safety_stock' => $suggestion->safety_stock,
                'urgency' => $suggestion->urgency,
                'urgency_label' => $suggestion->urgency_label,
                'confidence' => $suggestion->confidence,
                'explanation' => $suggestion->getExplanation(),
                'projected_stockout_date' => $suggestion->projected_stockout_date?->format('Y-m-d'),
                'days_until_stockout' => $suggestion->days_until_stockout,
            ] : null,
        ]);
    }

    /**
     * Approve selected suggestions and create a purchase order draft.
     */
    public function approve(Request $request)
    {
        $request->validate([
            'suggestion_ids' => 'required|array|min:1',
            'suggestion_ids.*' => 'exists:reorder_suggestions,id',
        ]);

        $suggestions = ReorderSuggestion::whereIn('id', $request->suggestion_ids)
            ->pending()
            ->with(['product', 'suggestedSupplier'])
            ->get();

        if ($suggestions->isEmpty()) {
            return back()->withErrors(['error' => __('Aucune suggestion valide sélectionnée.')]);
        }

        // Group by supplier
        $bySupplier = $suggestions->groupBy('suggested_supplier_id');

        // If all same supplier, redirect to create PO with prefill
        if ($bySupplier->count() === 1) {
            $supplierId = $bySupplier->keys()->first();
            $suggestionIds = $suggestions->pluck('id')->join(',');

            return redirect()->route('purchases.create', [
                'supplier_id' => $supplierId,
                'suggestion_ids' => $suggestionIds,
            ]);
        }

        // Multiple suppliers - let user choose
        return Inertia::render('Replenishment/ApproveMultiple', [
            'suggestionsBySupplier' => $bySupplier->map(function ($items, $supplierId) {
                $supplier = $items->first()->suggestedSupplier;
                return [
                    'supplier' => $supplier ? ['id' => $supplier->id, 'name' => $supplier->name] : null,
                    'suggestions' => $items->map(fn($s) => [
                        'id' => $s->id,
                        'product_name' => $s->product->name,
                        'recommended_qty' => $s->recommended_qty,
                        'urgency' => $s->urgency,
                    ]),
                    'total_items' => $items->count(),
                ];
            }),
        ]);
    }

    /**
     * Dismiss selected suggestions.
     */
    public function dismiss(Request $request)
    {
        $request->validate([
            'suggestion_ids' => 'required|array|min:1',
            'suggestion_ids.*' => 'exists:reorder_suggestions,id',
        ]);

        ReorderSuggestion::whereIn('id', $request->suggestion_ids)
            ->pending()
            ->update(['status' => 'dismissed']);

        return back()->with('success', __('Suggestions ignorées.'));
    }

    /**
     * Trigger recomputation of all suggestions.
     */
    public function recompute(Request $request)
    {
        if ($request->boolean('sync')) {
            // Synchronous for small datasets
            $suggestions = $this->reorderService->computeAllSuggestions();
            $count = $this->reorderService->saveAllSuggestions($suggestions);

            return back()->with('success', __(':count suggestions recalculées.', ['count' => $count]));
        }

        // Queue for large datasets
        ComputeReorderSuggestionsJob::dispatch();

        return back()->with('success', __('Recalcul des suggestions en cours...'));
    }

    /**
     * Quick stats API for dashboard widgets.
     */
    public function stats()
    {
        $stats = [
            'pending_suggestions' => ReorderSuggestion::pending()->count(),
            'critical_items' => ReorderSuggestion::pending()->critical()->count(),
            'stockouts_this_week' => ReorderSuggestion::pending()
                ->whereNotNull('projected_stockout_date')
                ->whereDate('projected_stockout_date', '<=', now()->addDays(7))
                ->count(),
            'pending_orders' => PurchaseOrder::pending()->count(),
            'orders_awaiting_receipt' => PurchaseOrder::where('status', 'sent')->count(),
        ];

        return response()->json($stats);
    }
}
