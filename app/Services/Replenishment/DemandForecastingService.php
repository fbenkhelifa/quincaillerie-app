<?php

namespace App\Services\Replenishment;

use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Demand Forecasting Service
 * 
 * Implements multiple forecasting methods:
 * - Simple Moving Average (SMA)
 * - Exponential Smoothing (ETS)
 * - Weighted Moving Average (WMA)
 * 
 * Designed to be extended with ML/LLM providers in the future.
 */
class DemandForecastingService
{
    /**
     * Default smoothing factor for exponential smoothing.
     */
    protected const DEFAULT_ALPHA = 0.3;

    /**
     * Minimum data points required for reliable forecasting.
     */
    protected const MIN_DATA_POINTS = 7;

    /**
     * Get daily sales data for a product over a period.
     */
    public function getSalesHistory(Product $product, int $days = 90): Collection
    {
        $startDate = now()->subDays($days)->startOfDay();

        return DB::table('bill_items')
            ->join('bills', 'bills.id', '=', 'bill_items.bill_id')
            ->where('bill_items.product_id', $product->id)
            ->where('bills.status', '!=', 'cancelled')
            ->where('bills.created_at', '>=', $startDate)
            ->selectRaw('DATE(bills.created_at) as sale_date, SUM(bill_items.quantity) as total_qty')
            ->groupBy('sale_date')
            ->orderBy('sale_date')
            ->get()
            ->keyBy('sale_date')
            ->map(fn($row) => (float) $row->total_qty);
    }

    /**
     * Fill missing dates with zero sales.
     */
    public function fillMissingDates(Collection $salesData, int $days): Collection
    {
        $filled = collect();
        $endDate = now()->startOfDay();
        $startDate = $endDate->copy()->subDays($days - 1);

        for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
            $dateStr = $date->format('Y-m-d');
            $filled[$dateStr] = $salesData[$dateStr] ?? 0;
        }

        return $filled;
    }

    /**
     * Calculate Simple Moving Average.
     */
    public function simpleMovingAverage(Collection $data, int $window = 7): float
    {
        if ($data->count() < $window) {
            return $data->count() > 0 ? $data->avg() : 0;
        }

        return $data->take(-$window)->avg();
    }

    /**
     * Calculate Exponential Smoothing forecast.
     * 
     * Formula: F(t+1) = α * A(t) + (1-α) * F(t)
     * Where:
     *   F = Forecast
     *   A = Actual
     *   α = Smoothing factor (0 < α < 1)
     */
    public function exponentialSmoothing(Collection $data, float $alpha = self::DEFAULT_ALPHA): float
    {
        if ($data->isEmpty()) {
            return 0;
        }

        $values = $data->values();
        $forecast = $values->first();

        foreach ($values->skip(1) as $actual) {
            $forecast = $alpha * $actual + (1 - $alpha) * $forecast;
        }

        return $forecast;
    }

    /**
     * Calculate Weighted Moving Average with more weight on recent data.
     */
    public function weightedMovingAverage(Collection $data, int $window = 7): float
    {
        if ($data->isEmpty()) {
            return 0;
        }

        $recent = $data->take(-$window)->values();
        $n = $recent->count();

        if ($n === 0) {
            return 0;
        }

        // Weights: 1, 2, 3, ..., n (most recent has highest weight)
        $weightSum = ($n * ($n + 1)) / 2;
        $weightedSum = 0;

        foreach ($recent as $i => $value) {
            $weight = $i + 1;
            $weightedSum += $value * $weight;
        }

        return $weightedSum / $weightSum;
    }

    /**
     * Forecast demand for next N days using ensemble method.
     */
    public function forecastDemand(Product $product, int $forecastDays = 30, int $historyDays = 90): array
    {
        $rawSales = $this->getSalesHistory($product, $historyDays);
        $salesData = $this->fillMissingDates($rawSales, $historyDays);

        if ($salesData->sum() === 0) {
            return [
                'avg_daily_demand' => 0,
                'forecasted_demand' => 0,
                'confidence' => 0,
                'method' => 'no_data',
                'forecast_series' => [],
                'history_series' => $this->formatHistorySeries($salesData),
            ];
        }

        // Calculate using multiple methods
        $sma7 = $this->simpleMovingAverage($salesData, 7);
        $sma30 = $this->simpleMovingAverage($salesData, 30);
        $ets = $this->exponentialSmoothing($salesData);
        $wma = $this->weightedMovingAverage($salesData, 14);

        // Ensemble: weighted average of methods (favor recent-weighted methods)
        $avgDailyDemand = ($sma7 * 0.2 + $wma * 0.4 + $ets * 0.4);

        // Calculate confidence based on data consistency
        $confidence = $this->calculateConfidence($salesData, $avgDailyDemand);

        // Generate forecast series for charts
        $forecastSeries = $this->generateForecastSeries($avgDailyDemand, $forecastDays);

        return [
            'avg_daily_demand' => round($avgDailyDemand, 4),
            'forecasted_demand' => round($avgDailyDemand * $forecastDays, 2),
            'confidence' => round($confidence, 2),
            'method' => 'ensemble',
            'components' => [
                'sma_7' => round($sma7, 4),
                'sma_30' => round($sma30, 4),
                'ets' => round($ets, 4),
                'wma_14' => round($wma, 4),
            ],
            'forecast_series' => $forecastSeries,
            'history_series' => $this->formatHistorySeries($salesData),
        ];
    }

    /**
     * Calculate confidence score (0-100) based on data quality and consistency.
     */
    protected function calculateConfidence(Collection $data, float $forecast): float
    {
        $n = $data->count();

        // Base confidence on data quantity
        $dataScore = min(100, ($n / self::MIN_DATA_POINTS) * 50);

        // Reduce confidence for high variance
        $values = $data->values()->filter(fn($v) => $v > 0);
        if ($values->count() < 2) {
            return $dataScore * 0.5;
        }

        $mean = $values->avg();
        $variance = $values->map(fn($v) => pow($v - $mean, 2))->avg();
        $stdDev = sqrt($variance);
        $cv = $mean > 0 ? ($stdDev / $mean) : 1; // Coefficient of variation

        // Lower CV = more consistent = higher confidence
        $consistencyScore = max(0, 50 - ($cv * 30));

        return min(100, $dataScore + $consistencyScore);
    }

    /**
     * Generate forecast series for charting.
     */
    protected function generateForecastSeries(float $avgDemand, int $days): array
    {
        $series = [];
        $today = now()->startOfDay();

        for ($i = 1; $i <= $days; $i++) {
            $date = $today->copy()->addDays($i);
            $series[] = [
                'date' => $date->format('Y-m-d'),
                'value' => round($avgDemand, 2),
                'type' => 'forecast',
            ];
        }

        return $series;
    }

    /**
     * Format history series for charting.
     */
    protected function formatHistorySeries(Collection $salesData): array
    {
        return $salesData->map(function ($value, $date) {
            return [
                'date' => $date,
                'value' => round($value, 2),
                'type' => 'actual',
            ];
        })->values()->toArray();
    }

    /**
     * Detect seasonality in sales data (simple week-over-week comparison).
     */
    public function detectSeasonality(Collection $data): array
    {
        $byDayOfWeek = collect();

        foreach ($data as $date => $value) {
            $dow = date('N', strtotime($date)); // 1=Monday, 7=Sunday
            if (!$byDayOfWeek->has($dow)) {
                $byDayOfWeek[$dow] = collect();
            }
            $byDayOfWeek[$dow]->push($value);
        }

        $dayAvgs = $byDayOfWeek->map(fn($vals) => $vals->avg())->sortKeys();
        $overallAvg = $data->avg();

        $seasonalFactors = $dayAvgs->map(fn($avg) => $overallAvg > 0 ? $avg / $overallAvg : 1);

        $peakDay = $seasonalFactors->sortDesc()->keys()->first();
        $lowDay = $seasonalFactors->sort()->keys()->first();

        $dayNames = [1 => 'Lundi', 2 => 'Mardi', 3 => 'Mercredi', 4 => 'Jeudi', 5 => 'Vendredi', 6 => 'Samedi', 7 => 'Dimanche'];

        return [
            'seasonal_factors' => $seasonalFactors->toArray(),
            'peak_day' => $dayNames[$peakDay] ?? null,
            'low_day' => $dayNames[$lowDay] ?? null,
            'has_pattern' => $seasonalFactors->max() - $seasonalFactors->min() > 0.3,
        ];
    }
}
