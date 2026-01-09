<?php

namespace App\Http\Controllers;

use App\Services\DashboardAnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardAnalyticsService $dashboardService
    ) {}

    public function index(Request $request): Response
    {
        // Parse date preset or custom dates
        $datePreset = $request->input('date_preset', '30d');
        [$startDate, $endDate] = $this->parseDatePreset($datePreset, $request);

        $filters = [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'worker_id' => $request->input('worker_id'),
            'payment_method' => $request->input('payment_method'),
            'category_id' => $request->input('category_id'),
        ];

        $dashboardData = $this->dashboardService->getDashboardData($filters);
        $filterOptions = $this->dashboardService->getFilterOptions();

        return Inertia::render('Dashboard', [
            'dashboardData' => $dashboardData,
            'filterOptions' => $filterOptions,
            'currentFilters' => [
                'date_preset' => $datePreset,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'worker_id' => $request->input('worker_id'),
                'payment_method' => $request->input('payment_method'),
                'category_id' => $request->input('category_id'),
            ],
        ]);
    }

    /**
     * API endpoint for refreshing dashboard data.
     */
    public function refresh(Request $request)
    {
        $datePreset = $request->input('date_preset', '30d');
        [$startDate, $endDate] = $this->parseDatePreset($datePreset, $request);

        $filters = [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'worker_id' => $request->input('worker_id'),
            'payment_method' => $request->input('payment_method'),
            'category_id' => $request->input('category_id'),
        ];

        return response()->json($this->dashboardService->getDashboardData($filters));
    }

    /**
     * Parse date preset to start/end dates.
     */
    protected function parseDatePreset(string $preset, Request $request): array
    {
        return match ($preset) {
            'today' => [now()->format('Y-m-d'), now()->format('Y-m-d')],
            '7d' => [now()->subDays(6)->format('Y-m-d'), now()->format('Y-m-d')],
            '30d' => [now()->subDays(29)->format('Y-m-d'), now()->format('Y-m-d')],
            '90d' => [now()->subDays(89)->format('Y-m-d'), now()->format('Y-m-d')],
            'mtd' => [now()->startOfMonth()->format('Y-m-d'), now()->format('Y-m-d')],
            'ytd' => [now()->startOfYear()->format('Y-m-d'), now()->format('Y-m-d')],
            'custom' => [
                $request->input('start_date', now()->subDays(29)->format('Y-m-d')),
                $request->input('end_date', now()->format('Y-m-d')),
            ],
            default => [now()->subDays(29)->format('Y-m-d'), now()->format('Y-m-d')],
        };
    }
}
