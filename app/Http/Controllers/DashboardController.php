<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Product;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $totalProducts = Product::count();
        $lowStockCount = Product::lowStock()->count();
        $outOfStockCount = Product::outOfStock()->count();
        
        $todaySales = Bill::completed()->today()->sum('total');
        $todayBillsCount = Bill::completed()->today()->count();
        
        $recentBills = Bill::with(['worker', 'user'])
            ->completed()
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($bill) => [
                'id' => $bill->id,
                'bill_number' => $bill->bill_number,
                'total' => $bill->total,
                'payment_method' => $bill->payment_method,
                'worker_name' => $bill->worker?->name,
                'created_at' => $bill->created_at->format('Y-m-d H:i'),
            ]);

        $lowStockProducts = Product::lowStock()
            ->with('category')
            ->orderBy('quantity')
            ->take(10)
            ->get()
            ->map(fn ($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'quantity' => $product->quantity,
                'min_stock' => $product->min_stock,
                'unit' => $product->unit,
                'category' => $product->category?->name,
            ]);

        $recentMovements = InventoryMovement::with(['product', 'user'])
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($movement) => [
                'id' => $movement->id,
                'product_name' => $movement->product?->name,
                'type' => $movement->type,
                'type_label' => $movement->getTypeLabel(),
                'quantity_change' => $movement->quantity_change,
                'user_name' => $movement->user?->name,
                'created_at' => $movement->created_at->format('Y-m-d H:i'),
            ]);

        // Calculate inventory value
        $inventoryValue = Product::selectRaw('SUM(quantity * purchase_price) as total')->value('total') ?? 0;
        $potentialRevenue = Product::selectRaw('SUM(quantity * selling_price) as total')->value('total') ?? 0;

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_products' => $totalProducts,
                'low_stock_count' => $lowStockCount,
                'out_of_stock_count' => $outOfStockCount,
                'today_sales' => round($todaySales, 2),
                'today_bills_count' => $todayBillsCount,
                'inventory_value' => round($inventoryValue, 2),
                'potential_revenue' => round($potentialRevenue, 2),
            ],
            'recentBills' => $recentBills,
            'lowStockProducts' => $lowStockProducts,
            'recentMovements' => $recentMovements,
        ]);
    }
}
