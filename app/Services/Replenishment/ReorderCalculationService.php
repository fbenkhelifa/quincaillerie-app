<?php

namespace App\Services\Replenishment;

use App\Models\Product;
use App\Models\ReorderSuggestion;
use Illuminate\Support\Facades\DB;

/**
 * Reorder Calculation Service
 * 
 * Computes reorder points, safety stock, and generates reorder suggestions.
 * 
 * Formulas:
 * - Reorder Point (ROP) = (Avg Daily Demand × Lead Time) + Safety Stock
 * - Safety Stock = Z × σ × √L
 *   Where Z = service level factor, σ = demand std dev, L = lead time
 * - Economic Order Quantity (simplified) = √(2DS/H)
 *   Where D = annual demand, S = order cost, H = holding cost
 */
class ReorderCalculationService
{
    protected DemandForecastingService $forecastingService;

    /**
     * Default service level Z-scores.
     * 95% service level = 1.65, 99% = 2.33
     */
    protected const SERVICE_LEVEL_Z = 1.65;

    /**
     * Default lead time if not specified (days).
     */
    protected const DEFAULT_LEAD_TIME = 7;

    /**
     * Minimum order quantity multiplier of average daily demand.
     */
    protected const MIN_ORDER_DAYS = 14;

    public function __construct(DemandForecastingService $forecastingService)
    {
        $this->forecastingService = $forecastingService;
    }

    /**
     * Compute a reorder suggestion for a single product.
     */
    public function computeForProduct(Product $product): ?array
    {
        // Get demand forecast
        $forecast = $this->forecastingService->forecastDemand($product, 30, 90);

        $avgDailyDemand = $forecast['avg_daily_demand'];
        $currentStock = (float) $product->quantity;
        $minStock = (float) $product->min_stock;

        // Get lead time from primary supplier
        $leadTime = $this->getLeadTime($product);

        // Calculate safety stock
        $safetyStock = $this->calculateSafetyStock($product, $avgDailyDemand, $leadTime);

        // Calculate reorder point
        $reorderPoint = $this->calculateReorderPoint($avgDailyDemand, $leadTime, $safetyStock);

        // Use min_stock as floor for reorder point
        $reorderPoint = max($reorderPoint, $minStock);

        // Check if reorder is needed
        if ($currentStock > $reorderPoint && $currentStock > $minStock) {
            return null; // No reorder needed
        }

        // Calculate recommended quantity
        $recommendedQty = $this->calculateRecommendedQuantity(
            $currentStock,
            $reorderPoint,
            $safetyStock,
            $avgDailyDemand
        );

        // Calculate projected stockout date
        $stockoutDate = $this->calculateStockoutDate($currentStock, $avgDailyDemand);

        // Determine urgency
        $urgency = $this->determineUrgency($currentStock, $reorderPoint, $stockoutDate, $leadTime);

        // Get suggested supplier
        $suggestedSupplier = $this->getSuggestedSupplier($product);

        // Build reason JSON
        $reasons = $this->buildReasons(
            $currentStock,
            $reorderPoint,
            $avgDailyDemand,
            $stockoutDate,
            $leadTime
        );

        return [
            'product_id' => $product->id,
            'suggested_supplier_id' => $suggestedSupplier?->id,
            'recommended_qty' => $recommendedQty,
            'current_stock' => $currentStock,
            'reorder_point' => $reorderPoint,
            'safety_stock' => $safetyStock,
            'avg_daily_demand' => $avgDailyDemand,
            'forecasted_demand_30d' => $forecast['forecasted_demand'],
            'projected_stockout_date' => $stockoutDate,
            'urgency' => $urgency,
            'confidence' => $forecast['confidence'],
            'reason_json' => $reasons,
            'forecast_data' => [
                'history' => $forecast['history_series'],
                'forecast' => $forecast['forecast_series'],
                'components' => $forecast['components'] ?? [],
            ],
            'computed_at' => now(),
        ];
    }

    /**
     * Calculate safety stock using statistical method.
     */
    protected function calculateSafetyStock(Product $product, float $avgDemand, int $leadTime): float
    {
        // Get demand variability
        $salesData = $this->forecastingService->getSalesHistory($product, 90);

        if ($salesData->count() < 7) {
            // Not enough data, use simple percentage of average
            return ceil($avgDemand * 3); // 3 days buffer
        }

        // Calculate standard deviation
        $values = $salesData->values();
        $mean = $values->avg();
        $variance = $values->map(fn($v) => pow($v - $mean, 2))->avg();
        $stdDev = sqrt($variance);

        // Safety Stock = Z × σ × √L
        $safetyStock = self::SERVICE_LEVEL_Z * $stdDev * sqrt($leadTime);

        // Apply minimum based on min_stock
        return max(ceil($safetyStock), ceil($product->min_stock * 0.5));
    }

    /**
     * Calculate reorder point.
     * ROP = (Avg Daily Demand × Lead Time) + Safety Stock
     */
    protected function calculateReorderPoint(float $avgDemand, int $leadTime, float $safetyStock): float
    {
        return ceil(($avgDemand * $leadTime) + $safetyStock);
    }

    /**
     * Calculate recommended order quantity.
     */
    protected function calculateRecommendedQuantity(
        float $currentStock,
        float $reorderPoint,
        float $safetyStock,
        float $avgDemand
    ): float {
        // Target stock level: enough for MIN_ORDER_DAYS of demand + safety stock
        $targetStock = ($avgDemand * self::MIN_ORDER_DAYS) + $safetyStock;

        // Order quantity to reach target
        $orderQty = max(0, $targetStock - $currentStock);

        // Round up to reasonable units
        return ceil($orderQty);
    }

    /**
     * Calculate projected stockout date.
     */
    protected function calculateStockoutDate(float $currentStock, float $avgDemand): ?\DateTime
    {
        if ($avgDemand <= 0) {
            return null; // No demand, no stockout
        }

        $daysUntilStockout = $currentStock / $avgDemand;

        if ($daysUntilStockout > 365) {
            return null; // Too far in the future
        }

        return now()->addDays(ceil($daysUntilStockout));
    }

    /**
     * Determine urgency level based on stock situation.
     */
    protected function determineUrgency(
        float $currentStock,
        float $reorderPoint,
        ?\DateTime $stockoutDate,
        int $leadTime
    ): string {
        // Critical: already out of stock or will stockout before lead time
        if ($currentStock <= 0) {
            return 'critical';
        }

        if ($stockoutDate) {
            $daysUntilStockout = now()->diffInDays($stockoutDate, false);

            if ($daysUntilStockout <= $leadTime) {
                return 'critical';
            }

            if ($daysUntilStockout <= $leadTime * 1.5) {
                return 'high';
            }

            if ($daysUntilStockout <= $leadTime * 2) {
                return 'medium';
            }
        }

        // Based on stock vs reorder point
        $ratio = $reorderPoint > 0 ? $currentStock / $reorderPoint : 1;

        if ($ratio < 0.5) {
            return 'high';
        }

        if ($ratio < 1) {
            return 'medium';
        }

        return 'low';
    }

    /**
     * Get lead time for a product from its primary supplier.
     */
    protected function getLeadTime(Product $product): int
    {
        $primarySupplier = DB::table('product_supplier')
            ->where('product_id', $product->id)
            ->where('is_primary', true)
            ->first();

        if ($primarySupplier && isset($primarySupplier->lead_time_days)) {
            return (int) $primarySupplier->lead_time_days;
        }

        // Fallback to any supplier
        $anySupplier = DB::table('product_supplier')
            ->where('product_id', $product->id)
            ->first();

        if ($anySupplier && isset($anySupplier->lead_time_days)) {
            return (int) $anySupplier->lead_time_days;
        }

        return self::DEFAULT_LEAD_TIME;
    }

    /**
     * Get suggested supplier for reorder.
     */
    protected function getSuggestedSupplier(Product $product)
    {
        // Prefer primary supplier
        $primary = $product->suppliers()
            ->wherePivot('is_primary', true)
            ->first();

        if ($primary) {
            return $primary;
        }

        // Fallback to first active supplier
        return $product->suppliers()
            ->where('is_active', true)
            ->first();
    }

    /**
     * Build reasons JSON for explanation.
     */
    protected function buildReasons(
        float $currentStock,
        float $reorderPoint,
        float $avgDemand,
        ?\DateTime $stockoutDate,
        int $leadTime
    ): array {
        $reasons = [];

        if ($currentStock <= $reorderPoint) {
            $reasons['below_reorder_point'] = true;
        }

        if ($avgDemand > 0) {
            // Define "high demand" as more than 2 units per day
            if ($avgDemand >= 2) {
                $reasons['high_demand'] = $avgDemand;
            }
        }

        if ($stockoutDate) {
            $daysUntil = now()->diffInDays($stockoutDate, false);
            if ($daysUntil <= $leadTime * 2) {
                $reasons['stockout_imminent'] = $daysUntil;
            }
        }

        $reasons['lead_time_buffer'] = $leadTime;

        return $reasons;
    }

    /**
     * Batch compute suggestions for all products needing reorder.
     */
    public function computeAllSuggestions(): array
    {
        $suggestions = [];

        // Get active products that might need reorder
        $products = Product::active()
            ->where(function ($query) {
                $query->whereColumn('quantity', '<=', 'min_stock')
                    ->orWhere('quantity', '<', 50); // Also check low-ish stock
            })
            ->with(['suppliers'])
            ->get();

        foreach ($products as $product) {
            $suggestion = $this->computeForProduct($product);

            if ($suggestion && $suggestion['recommended_qty'] > 0) {
                $suggestions[] = $suggestion;
            }
        }

        return $suggestions;
    }

    /**
     * Save suggestions to database, replacing old pending ones.
     */
    public function saveAllSuggestions(array $suggestions): int
    {
        $savedCount = 0;

        DB::transaction(function () use ($suggestions, &$savedCount) {
            // Mark old pending suggestions as stale (dismiss them)
            ReorderSuggestion::pending()
                ->where('computed_at', '<', now()->subHours(24))
                ->update(['status' => 'dismissed']);

            foreach ($suggestions as $suggestionData) {
                // Upsert: update existing pending or create new
                $existing = ReorderSuggestion::where('product_id', $suggestionData['product_id'])
                    ->pending()
                    ->first();

                if ($existing) {
                    $existing->update($suggestionData);
                } else {
                    ReorderSuggestion::create($suggestionData);
                }

                $savedCount++;
            }
        });

        return $savedCount;
    }
}
