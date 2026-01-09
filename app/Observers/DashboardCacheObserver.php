<?php

namespace App\Observers;

use App\Models\Bill;
use App\Services\DashboardAnalyticsService;

class DashboardCacheObserver
{
    /**
     * Invalidate dashboard cache when a bill is created/updated/deleted.
     */
    public function saved(Bill $bill): void
    {
        DashboardAnalyticsService::invalidateCache();
    }

    public function deleted(Bill $bill): void
    {
        DashboardAnalyticsService::invalidateCache();
    }
}
