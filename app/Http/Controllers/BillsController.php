<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\BillItem;
use App\Models\Product;
use App\Models\Setting;
use App\Models\Worker;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BillsController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Bill::with(['worker', 'user']);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('bill_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($paymentMethod = $request->get('payment_method')) {
            $query->where('payment_method', $paymentMethod);
        }

        if ($dateFrom = $request->get('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->get('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $bills = $query->latest()->paginate(25)->withQueryString();

        return Inertia::render('Bills/Index', [
            'bills' => $bills,
            'filters' => $request->only(['search', 'status', 'payment_method', 'date_from', 'date_to']),
        ]);
    }

    public function create(): Response
    {
        $workers = Worker::active()->orderBy('name')->get(['id', 'name', 'role']);
        $settings = Setting::instance();

        return Inertia::render('Bills/Create', [
            'workers' => $workers,
            'storeSettings' => [
                'store_name' => $settings->store_name,
                'owner_name' => $settings->owner_name,
                'phone' => $settings->phone,
                'address' => $settings->address,
                'currency' => $settings->currency,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'worker_id' => 'nullable|exists:workers,id',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'payment_method' => 'required|in:cash,card,check,credit,other',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount' => 'nullable|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Create bill
            $bill = Bill::create([
                'user_id' => auth()->id(),
                'worker_id' => $validated['worker_id'],
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'discount' => $validated['discount'] ?? 0,
                'tax' => $validated['tax'] ?? 0,
                'payment_method' => $validated['payment_method'],
                'notes' => $validated['notes'],
                'status' => 'completed',
            ]);

            $subtotal = 0;

            foreach ($validated['items'] as $itemData) {
                $product = Product::findOrFail($itemData['product_id']);

                // Check stock
                if ($product->quantity < $itemData['quantity']) {
                    throw new \Exception("Stock insuffisant pour {$product->name}. Disponible: {$product->quantity}");
                }

                $itemTotal = ($itemData['quantity'] * $itemData['unit_price']) - ($itemData['discount'] ?? 0);

                // Create bill item
                $bill->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity' => $itemData['quantity'],
                    'unit' => $product->unit,
                    'unit_price' => $itemData['unit_price'],
                    'discount' => $itemData['discount'] ?? 0,
                    'total' => $itemTotal,
                ]);

                // Reduce stock and create inventory movement
                $product->adjustStock(
                    -$itemData['quantity'],
                    'sale',
                    auth()->id(),
                    $bill->id,
                    'Vente - ' . $bill->bill_number
                );

                $subtotal += $itemTotal;
            }

            // Update bill totals
            $bill->update([
                'subtotal' => $subtotal,
                'total' => $subtotal - ($validated['discount'] ?? 0) + ($validated['tax'] ?? 0),
            ]);

            DB::commit();

            return redirect()->route('bills.show', $bill)
                ->with('success', __('Facture créée avec succès.'));

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function show(Bill $bill): Response
    {
        $bill->load(['items.product', 'worker', 'user']);
        $settings = Setting::instance();

        return Inertia::render('Bills/Show', [
            'bill' => $bill,
            'storeSettings' => [
                'store_name' => $settings->store_name,
                'owner_name' => $settings->owner_name,
                'phone' => $settings->phone,
                'address' => $settings->address,
                'logo' => $settings->logo,
                'currency' => $settings->currency,
                'tax_id' => $settings->tax_id,
            ],
        ]);
    }

    public function edit(Bill $bill): Response
    {
        if ($bill->status === 'cancelled') {
            return redirect()->route('bills.show', $bill)
                ->with('error', 'Impossible de modifier une facture annulée.');
        }

        $bill->load(['items.product', 'worker']);
        $workers = Worker::active()->orderBy('name')->get(['id', 'name', 'role']);
        $settings = Setting::instance();

        // Format items for the form
        $formattedItems = $bill->items->map(function ($item) {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'product_sku' => $item->product_sku,
                'quantity' => (float) $item->quantity,
                'unit' => $item->unit,
                'unit_price' => (float) $item->unit_price,
                'discount' => (float) $item->discount,
                'available_stock' => $item->product ? (float) $item->product->quantity + $item->quantity : $item->quantity,
                'original_quantity' => (float) $item->quantity,
            ];
        });

        return Inertia::render('Bills/Edit', [
            'bill' => $bill,
            'billItems' => $formattedItems,
            'workers' => $workers,
            'storeSettings' => [
                'store_name' => $settings->store_name,
                'owner_name' => $settings->owner_name,
                'phone' => $settings->phone,
                'address' => $settings->address,
                'currency' => $settings->currency,
            ],
        ]);
    }

    public function update(Request $request, Bill $bill)
    {
        if ($bill->status === 'cancelled') {
            return back()->withErrors(['error' => 'Impossible de modifier une facture annulée.']);
        }

        $validated = $request->validate([
            'worker_id' => 'nullable|exists:workers,id',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'payment_method' => 'required|in:cash,card,check,credit,other',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|exists:bill_items,id',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount' => 'nullable|numeric|min:0',
            'items.*.original_quantity' => 'nullable|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Restore stock from old items
            foreach ($bill->items as $oldItem) {
                if ($oldItem->product) {
                    $oldItem->product->adjustStock(
                        $oldItem->quantity,
                        'adjustment',
                        auth()->id(),
                        $bill->id,
                        'Modification facture (restauration) - ' . $bill->bill_number
                    );
                }
            }

            // Delete old items
            $bill->items()->delete();

            $subtotal = 0;

            foreach ($validated['items'] as $itemData) {
                $product = Product::findOrFail($itemData['product_id']);

                // Check stock
                if ($product->quantity < $itemData['quantity']) {
                    throw new \Exception("Stock insuffisant pour {$product->name}. Disponible: {$product->quantity}");
                }

                $itemTotal = ($itemData['quantity'] * $itemData['unit_price']) - ($itemData['discount'] ?? 0);

                // Create bill item
                $bill->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity' => $itemData['quantity'],
                    'unit' => $product->unit,
                    'unit_price' => $itemData['unit_price'],
                    'discount' => $itemData['discount'] ?? 0,
                    'total' => $itemTotal,
                ]);

                // Reduce stock
                $product->adjustStock(
                    -$itemData['quantity'],
                    'sale',
                    auth()->id(),
                    $bill->id,
                    'Modification facture - ' . $bill->bill_number
                );

                $subtotal += $itemTotal;
            }

            // Update bill
            $bill->update([
                'worker_id' => $validated['worker_id'],
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'discount' => $validated['discount'] ?? 0,
                'tax' => $validated['tax'] ?? 0,
                'payment_method' => $validated['payment_method'],
                'notes' => $validated['notes'],
                'subtotal' => $subtotal,
                'total' => $subtotal - ($validated['discount'] ?? 0) + ($validated['tax'] ?? 0),
            ]);

            DB::commit();

            return redirect()->route('bills.show', $bill)
                ->with('success', __('Facture mise à jour avec succès.'));

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function downloadPdf(Bill $bill, string $lang = 'fr')
    {
        $bill->load(['items.product', 'worker', 'user']);
        $settings = Setting::instance();

        $isRtl = $lang === 'ar';
        
        $pdf = Pdf::loadView('bills.invoice', [
            'bill' => $bill,
            'settings' => $settings,
            'lang' => $lang,
            'isRtl' => $isRtl,
        ]);

        $pdf->setPaper('A4');
        
        return $pdf->download("facture-{$bill->bill_number}.pdf");
    }

    public function cancel(Bill $bill)
    {
        if ($bill->status === 'cancelled') {
            return back()->withErrors(['error' => 'Cette facture est déjà annulée.']);
        }

        try {
            DB::beginTransaction();

            // Restore stock for each item
            foreach ($bill->items as $item) {
                if ($item->product) {
                    $item->product->adjustStock(
                        $item->quantity,
                        'return',
                        auth()->id(),
                        $bill->id,
                        'Annulation facture - ' . $bill->bill_number
                    );
                }
            }

            $bill->update(['status' => 'cancelled']);

            DB::commit();

            return back()->with('success', __('Facture annulée avec succès.'));

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
