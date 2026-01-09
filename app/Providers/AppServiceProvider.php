<?php

namespace App\Providers;

use App\Models\Bill;
use App\Models\InventoryMovement;
use App\Observers\DashboardCacheObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Register observers for dashboard cache invalidation
        Bill::observe(DashboardCacheObserver::class);
    }
}
