<?php

/**
 * Demo Seed Configuration
 * 
 * Controls the size of demo data generation.
 * Use SEED_SIZE env variable: small, medium, large
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Seed Size
    |--------------------------------------------------------------------------
    | small  - Quick testing (~200 products, ~500 bills)
    | medium - Balanced demo (~400 products, ~2000 bills)
    | large  - Full WOW demo (~800 products, ~5000 bills)
    */
    'size' => env('SEED_SIZE', 'medium'),

    'sizes' => [
        'small' => [
            'products' => 200,
            'suppliers' => 15,
            'workers' => 4,
            'bills' => 500,
            'months_back' => 6,
            'purchase_orders' => 80,
        ],
        'medium' => [
            'products' => 400,
            'suppliers' => 22,
            'workers' => 8,
            'bills' => 2000,
            'months_back' => 9,
            'purchase_orders' => 200,
        ],
        'large' => [
            'products' => 800,
            'suppliers' => 30,
            'workers' => 12,
            'bills' => 5000,
            'months_back' => 12,
            'purchase_orders' => 400,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Anomaly Patterns
    |--------------------------------------------------------------------------
    */
    'anomalies' => [
        'high_cancellation_cashier_rate' => 0.15, // 15% cancellation rate
        'normal_cancellation_rate' => 0.02, // 2% normal
        'large_adjustment_count' => 8,
        'dead_stock_products' => 15, // products with no sales in 90+ days
        'discount_outliers' => 10, // bills with >30% discount
    ],

    /*
    |--------------------------------------------------------------------------
    | Seasonal Patterns (month => demand multiplier)
    |--------------------------------------------------------------------------
    */
    'seasonal_patterns' => [
        // Summer construction season (June-August)
        6 => 1.4, 7 => 1.5, 8 => 1.3,
        // Ramadan period (varies, simulate as slower)
        3 => 0.8, 4 => 0.75,
        // Winter slowdown
        12 => 0.9, 1 => 0.85, 2 => 0.9,
        // Default months
        5 => 1.1, 9 => 1.2, 10 => 1.1, 11 => 1.0,
    ],
];
