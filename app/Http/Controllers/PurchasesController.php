<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use App\Http\Requests\StorePurchaseOrderRequest;
use App\Http\Requests\UpdatePurchaseOrderRequest;
use App\Http\Requests\ReceivePurchaseOrderRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class PurchasesController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['supplier', 'user'])
            ->withCount('items');

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('po_number', 'like', "%{$search}%")
                    ->orWhereHas('supplier', fn($sq) => $sq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('order_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('order_date', '<=', $request->date_to);
        }

        $orders = $query->latest('order_date')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Purchases/Index', [
            'orders' => $orders,
            'suppliers' => Supplier::active()->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['status', 'supplier_id', 'search', 'date_from', 'date_to']),
            'stats' => [
                'draft' => PurchaseOrder::draft()->count(),
                'pending' => PurchaseOrder::pending()->count(),
                'received_this_month' => PurchaseOrder::completed()
                    ->whereMonth('received_date', now()->month)
                    ->count(),
            ],
        ]);
    }

    public function create(Request $request)
    {
        $suppliers = Supplier::active()->orderBy('name')->get();

        // Pre-select supplier if coming from replenishment
        $selectedSupplierId = $request->get('supplier_id');

        // Get products for the form
        $products = Product::active()
            ->with(['suppliers' => fn($q) => $q->select('suppliers.id', 'name')])
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'purchase_price', 'unit', 'quantity']);

        // Pre-fill items if coming from replenishment suggestions
        $prefillItems = [];
        if ($request->filled('suggestion_ids')) {
            $suggestionIds = explode(',', $request->suggestion_ids);
            $suggestions = \App\Models\ReorderSuggestion::whereIn('id', $suggestionIds)
                ->with(['product:id,name,sku,purchase_price,unit'])
                ->get();

            foreach ($suggestions as $suggestion) {
                $prefillItems[] = [
                    'product_id' => $suggestion->product_id,
                    'product_name' => $suggestion->product->name,
                    'product_sku' => $suggestion->product->sku,
                    'quantity_ordered' => $suggestion->recommended_qty,
                    'unit' => $suggestion->product->unit,
                    'unit_cost' => $suggestion->product->purchase_price,
                    'suggestion_id' => $suggestion->id,
                ];
            }
        }

        return Inertia::render('Purchases/Create', [
            'suppliers' => $suppliers,
            'products' => $products,
            'selectedSupplierId' => $selectedSupplierId,
            'prefillItems' => $prefillItems,
            'nextPoNumber' => PurchaseOrder::generatePoNumber(),
        ]);
    }

    public function store(StorePurchaseOrderRequest $request)
    {
        $validated = $request->validated();

        DB::beginTransaction();

        try {
            // Create purchase order
            $po = PurchaseOrder::create([
                'po_number' => PurchaseOrder::generatePoNumber(),
                'supplier_id' => $validated['supplier_id'],
                'user_id' => auth()->id(),
                'status' => 'draft',
                'order_date' => $validated['order_date'],
                'expected_date' => $validated['expected_date'] ?? null,
                'tax' => $validated['tax'] ?? 0,
                'shipping' => $validated['shipping'] ?? 0,
                'notes' => $validated['notes'] ?? null,
                'supplier_notes' => $validated['supplier_notes'] ?? null,
            ]);

            $subtotal = 0;

            // Create items
            foreach ($validated['items'] as $itemData) {
                $product = Product::findOrFail($itemData['product_id']);
                $itemTotal = $itemData['quantity_ordered'] * $itemData['unit_cost'];

                $po->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity_ordered' => $itemData['quantity_ordered'],
                    'unit' => $product->unit,
                    'unit_cost' => $itemData['unit_cost'],
                    'total' => $itemTotal,
                ]);

                $subtotal += $itemTotal;

                // Link reorder suggestion if provided
                if (!empty($itemData['suggestion_id'])) {
                    \App\Models\ReorderSuggestion::where('id', $itemData['suggestion_id'])
                        ->update([
                            'status' => 'ordered',
                            'purchase_order_id' => $po->id,
                        ]);
                }
            }

            // Update totals
            $po->update([
                'subtotal' => $subtotal,
                'total' => $subtotal + ($validated['tax'] ?? 0) + ($validated['shipping'] ?? 0),
            ]);

            DB::commit();

            return redirect()->route('purchases.show', $po)
                ->with('success', __('Commande d\'achat créée avec succès.'));

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    public function show(PurchaseOrder $purchase)
    {
        $purchase->load([
            'supplier',
            'user',
            'items.product',
        ]);

        return Inertia::render('Purchases/Show', [
            'order' => $purchase,
        ]);
    }

    public function edit(PurchaseOrder $purchase)
    {
        if ($purchase->status !== 'draft') {
            return back()->withErrors(['error' => __('Seules les commandes en brouillon peuvent être modifiées.')]);
        }

        $purchase->load('items.product');

        return Inertia::render('Purchases/Edit', [
            'order' => $purchase,
            'suppliers' => Supplier::active()->orderBy('name')->get(),
            'products' => Product::active()->orderBy('name')->get(['id', 'name', 'sku', 'purchase_price', 'unit']),
        ]);
    }

    public function update(UpdatePurchaseOrderRequest $request, PurchaseOrder $purchase)
    {
        if ($purchase->status !== 'draft') {
            return back()->withErrors(['error' => __('Seules les commandes en brouillon peuvent être modifiées.')]);
        }

        $validated = $request->validated();

        DB::beginTransaction();

        try {
            // Update order details
            $purchase->update([
                'supplier_id' => $validated['supplier_id'],
                'order_date' => $validated['order_date'],
                'expected_date' => $validated['expected_date'] ?? null,
                'tax' => $validated['tax'] ?? 0,
                'shipping' => $validated['shipping'] ?? 0,
                'notes' => $validated['notes'] ?? null,
                'supplier_notes' => $validated['supplier_notes'] ?? null,
            ]);

            // Delete existing items and recreate
            $purchase->items()->delete();

            $subtotal = 0;

            foreach ($validated['items'] as $itemData) {
                $product = Product::findOrFail($itemData['product_id']);
                $itemTotal = $itemData['quantity_ordered'] * $itemData['unit_cost'];

                $purchase->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity_ordered' => $itemData['quantity_ordered'],
                    'unit' => $product->unit,
                    'unit_cost' => $itemData['unit_cost'],
                    'total' => $itemTotal,
                ]);

                $subtotal += $itemTotal;
            }

            $purchase->update([
                'subtotal' => $subtotal,
                'total' => $subtotal + ($validated['tax'] ?? 0) + ($validated['shipping'] ?? 0),
            ]);

            DB::commit();

            return redirect()->route('purchases.show', $purchase)
                ->with('success', __('Commande d\'achat mise à jour.'));

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    public function destroy(PurchaseOrder $purchase)
    {
        if (!in_array($purchase->status, ['draft', 'cancelled'])) {
            return back()->withErrors(['error' => __('Seules les commandes en brouillon ou annulées peuvent être supprimées.')]);
        }

        $purchase->delete();

        return redirect()->route('purchases.index')
            ->with('success', __('Commande d\'achat supprimée.'));
    }

    /**
     * Mark order as sent to supplier.
     */
    public function send(PurchaseOrder $purchase)
    {
        if ($purchase->status !== 'draft') {
            return back()->withErrors(['error' => __('Seules les commandes en brouillon peuvent être envoyées.')]);
        }

        $purchase->markAsSent();

        return back()->with('success', __('Commande marquée comme envoyée.'));
    }

    /**
     * Cancel a purchase order.
     */
    public function cancel(PurchaseOrder $purchase)
    {
        if (in_array($purchase->status, ['received', 'cancelled'])) {
            return back()->withErrors(['error' => __('Cette commande ne peut pas être annulée.')]);
        }

        $purchase->update(['status' => 'cancelled']);

        return back()->with('success', __('Commande annulée.'));
    }

    /**
     * Show receive items form.
     */
    public function receiveForm(PurchaseOrder $purchase)
    {
        if (!$purchase->canReceive()) {
            return back()->withErrors(['error' => __('Cette commande ne peut pas recevoir de marchandises.')]);
        }

        $purchase->load('items.product', 'supplier');

        return Inertia::render('Purchases/Receive', [
            'order' => $purchase,
        ]);
    }

    /**
     * Receive items and update stock.
     */
    public function receive(ReceivePurchaseOrderRequest $request, PurchaseOrder $purchase)
    {
        if (!$purchase->canReceive()) {
            return back()->withErrors(['error' => __('Cette commande ne peut pas recevoir de marchandises.')]);
        }

        $validated = $request->validated();

        DB::beginTransaction();

        try {
            foreach ($validated['items'] as $itemData) {
                $item = $purchase->items()->findOrFail($itemData['item_id']);
                $quantityToReceive = (float) $itemData['quantity_received'];

                if ($quantityToReceive > 0) {
                    $item->receive($quantityToReceive, auth()->id());
                }
            }

            // Update order status
            if ($purchase->isFullyReceived()) {
                $purchase->markAsReceived();
            } else {
                $purchase->update(['status' => 'partial']);
            }

            DB::commit();

            return redirect()->route('purchases.show', $purchase)
                ->with('success', __('Marchandises reçues avec succès.'));

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Generate PDF for purchase order.
     */
    public function downloadPdf(PurchaseOrder $purchase, string $lang = 'fr')
    {
        app()->setLocale($lang);

        $purchase->load(['supplier', 'items.product', 'user']);

        $settings = \App\Models\Setting::getAllCached();

        $pdf = Pdf::loadView('pdf.purchase-order', [
            'order' => $purchase,
            'settings' => $settings,
            'lang' => $lang,
        ]);

        $filename = "PO-{$purchase->po_number}.pdf";

        return $pdf->download($filename);
    }
}
