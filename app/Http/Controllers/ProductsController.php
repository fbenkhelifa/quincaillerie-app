<?php

namespace App\Http\Controllers;

use App\Domains\Products\Queries\ProductIndexQuery;
use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductsController extends Controller
{
    public function index(Request $request): Response
    {
        $products = (new ProductIndexQuery($request))->apply()->paginate(25);

        $categories = Category::active()->orderBy('name')->get(['id', 'name', 'name_ar']);
        $suppliers = Supplier::active()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'suppliers' => $suppliers,
            'filters' => $request->only([
                'search', 'category_id', 'supplier_id', 'stock_status',
                'min_price', 'max_price', 'date_from', 'date_to',
                'sort', 'direction', 'per_page'
            ]),
        ]);
    }

    public function create(): Response
    {
        $categories = Category::active()->orderBy('name')->get(['id', 'name', 'name_ar']);
        $suppliers = Supplier::active()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Products/Create', [
            'categories' => $categories,
            'suppliers' => $suppliers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:100|unique:products',
            'barcode' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|string|max:20',
            'min_stock' => 'required|numeric|min:0',
            'location' => 'nullable|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_active' => 'boolean',
            'suppliers' => 'nullable|array',
            'suppliers.*' => 'exists:suppliers,id',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($validated);

        if (!empty($validated['suppliers'])) {
            $product->suppliers()->attach($validated['suppliers']);
        }

        // Create initial inventory movement if quantity > 0
        if ($product->quantity > 0) {
            $product->inventoryMovements()->create([
                'user_id' => auth()->id(),
                'type' => 'purchase',
                'quantity_before' => 0,
                'quantity_change' => $product->quantity,
                'quantity_after' => $product->quantity,
                'unit_cost' => $product->purchase_price,
                'reason' => 'Stock initial',
            ]);
        }

        return redirect()->route('products.index')
            ->with('success', __('Produit créé avec succès.'));
    }

    public function show(Product $product): Response
    {
        $product->load(['category', 'suppliers', 'inventoryMovements' => function ($q) {
            $q->with('user')->latest()->take(20);
        }]);

        return Inertia::render('Products/Show', [
            'product' => $product,
        ]);
    }

    public function edit(Product $product): Response
    {
        $product->load('suppliers');
        $categories = Category::active()->orderBy('name')->get(['id', 'name', 'name_ar']);
        $suppliers = Supplier::active()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Products/Edit', [
            'product' => [
                ...$product->toArray(),
                'supplier_ids' => $product->suppliers->pluck('id')->toArray(),
            ],
            'categories' => $categories,
            'suppliers' => $suppliers,
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:100|unique:products,sku,' . $product->id,
            'barcode' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'unit' => 'required|string|max:20',
            'min_stock' => 'required|numeric|min:0',
            'location' => 'nullable|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_active' => 'boolean',
            'suppliers' => 'nullable|array',
            'suppliers.*' => 'exists:suppliers,id',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        if (array_key_exists('suppliers', $validated)) {
            $product->suppliers()->sync($validated['suppliers'] ?? []);
        }

        return redirect()->route('products.index')
            ->with('success', __('Produit mis à jour avec succès.'));
    }

    public function destroy(Product $product)
    {
        if ($product->image && Storage::disk('public')->exists($product->image)) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()->route('products.index')
            ->with('success', __('Produit supprimé avec succès.'));
    }

    public function adjustStock(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity_change' => 'required|numeric',
            'type' => 'required|in:purchase,adjustment,return,damage',
            'reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $product->adjustStock(
            $validated['quantity_change'],
            $validated['type'],
            auth()->id(),
            null,
            $validated['reason'] ?? null,
            $validated['notes'] ?? null
        );

        return back()->with('success', __('Stock mis à jour avec succès.'));
    }

    public function search(Request $request)
    {
        $search = $request->get('q', '');

        $products = Product::query()
            ->where('is_active', true)
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('barcode', $search)
                    ->orWhere('sku', 'like', "%{$search}%");
            })
            ->with('category')
            ->limit(20)
            ->get(['id', 'name', 'name_ar', 'sku', 'barcode', 'selling_price', 'quantity', 'unit', 'category_id']);

        return response()->json($products);
    }
}
