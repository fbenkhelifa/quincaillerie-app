<?php

namespace App\Jobs;

use App\Services\Analytics\SalesAnalyticsService;
use App\Services\Analytics\InventoryAnalyticsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class ComputeDailyAnalyticsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Carbon $date;

    public function __construct(?Carbon $date = null)
    {
        $this->date = $date ?? now()->subDay();
    }

    public function handle(
        SalesAnalyticsService $salesService,
        InventoryAnalyticsService $inventoryService
    ): void {
        Log::info('Computing daily analytics snapshot', ['date' => $this->date->format('Y-m-d')]);

        try {
            // Save sales snapshot
            $salesService->saveDailySnapshot($this->date);

            // Save inventory snapshot
            $inventoryService->saveDailySnapshot($this->date);

            Log::info('Daily analytics snapshot completed');
        } catch (\Exception $e) {
            Log::error('Daily analytics job failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }
}
