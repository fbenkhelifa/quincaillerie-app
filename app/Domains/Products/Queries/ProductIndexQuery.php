<?php

namespace App\Domains\Products\Queries;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductIndexQuery
{
    protected Builder $query;
    protected Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->query = Product::query()->with(['category', 'suppliers']);
    }

    public function apply(): self
    {
        $this->applySearch();
        $this->applyFilters();
        $this->applySorting();

        return $this;
    }

    protected function applySearch(): void
    {
        $search = $this->request->get('search');

        if (!empty($search)) {
            $this->query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('name_ar', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }
    }

    protected function applyFilters(): void
    {
        // Category filter
        $categoryId = $this->request->get('category_id');
        if (!empty($categoryId)) {
            if (is_array($categoryId)) {
                $this->query->whereIn('category_id', $categoryId);
            } else {
                $this->query->where('category_id', $categoryId);
            }
        }

        // Supplier filter
        $supplierId = $this->request->get('supplier_id');
        if (!empty($supplierId)) {
            $supplierIds = is_array($supplierId) ? $supplierId : [$supplierId];
            $this->query->whereHas('suppliers', function ($q) use ($supplierIds) {
                $q->whereIn('suppliers.id', $supplierIds);
            });
        }

        // Stock status filter
        $stockStatus = $this->request->get('stock_status');
        if (!empty($stockStatus)) {
            switch ($stockStatus) {
                case 'low':
                    $this->query->lowStock();
                    break;
                case 'out':
                    $this->query->outOfStock();
                    break;
                case 'in':
                    $this->query->inStock();
                    break;
                case 'available':
                    $this->query->whereColumn('quantity', '>', 'min_stock');
                    break;
            }
        }

        // Price range filter
        $minPrice = $this->request->get('min_price');
        $maxPrice = $this->request->get('max_price');

        if (!is_null($minPrice) && is_numeric($minPrice)) {
            $this->query->where('selling_price', '>=', $minPrice);
        }

        if (!is_null($maxPrice) && is_numeric($maxPrice)) {
            $this->query->where('selling_price', '<=', $maxPrice);
        }

        // Date range filter
        $dateFrom = $this->request->get('date_from');
        $dateTo = $this->request->get('date_to');

        if (!empty($dateFrom)) {
            $this->query->whereDate('created_at', '>=', $dateFrom);
        }

        if (!empty($dateTo)) {
            $this->query->whereDate('created_at', '<=', $dateTo);
        }

        // Active status filter
        $isActive = $this->request->get('is_active');
        if (!is_null($isActive)) {
            $this->query->where('is_active', filter_var($isActive, FILTER_VALIDATE_BOOLEAN));
        }
    }

    protected function applySorting(): void
    {
        $sortField = $this->request->get('sort', 'created_at');
        $sortDirection = $this->request->get('direction', 'desc');

        $allowedSortFields = [
            'id', 'name', 'sku', 'barcode', 'purchase_price', 'selling_price',
            'quantity', 'min_stock', 'created_at', 'updated_at'
        ];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }

        if (!in_array(strtolower($sortDirection), ['asc', 'desc'])) {
            $sortDirection = 'desc';
        }

        $this->query->orderBy($sortField, $sortDirection);
    }

    public function paginate(int $perPage = 25): LengthAwarePaginator
    {
        $perPage = min(max((int) $this->request->get('per_page', $perPage), 10), 100);
        
        return $this->query->paginate($perPage)->withQueryString();
    }

    public function get()
    {
        return $this->query->get();
    }

    public function getQuery(): Builder
    {
        return $this->query;
    }
}
