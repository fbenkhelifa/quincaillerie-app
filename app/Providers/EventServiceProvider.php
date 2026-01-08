<?php

namespace App\Providers;

use App\Events\BillCancelled;
use App\Events\ProductPriceChanged;
use App\Events\PurchaseReceived;
use App\Events\StockAdjusted;
use App\Listeners\LogBillCancellation;
use App\Listeners\LogProductPriceChange;
use App\Listeners\LogPurchaseReceived;
use App\Listeners\LogStockAdjustment;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        BillCancelled::class => [
            LogBillCancellation::class,
        ],
        StockAdjusted::class => [
            LogStockAdjustment::class,
        ],
        PurchaseReceived::class => [
            LogPurchaseReceived::class,
        ],
        ProductPriceChanged::class => [
            LogProductPriceChange::class,
        ],
    ];

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
