<?php

namespace App\Jobs;

use App\Models\JobRun;
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
    protected ?JobRun $jobRun = null;

    public function __construct(?Carbon $date = null)
    {
        $this->date = $date ?? now()->subDay();
    }

    public function handle(
        SalesAnalyticsService $salesService,
        InventoryAnalyticsService $inventoryService
    ): void {
        $this->jobRun = JobRun::startRun(JobRun::JOB_ANALYTICS_AGGREGATES, JobRun::GROUP_ANALYTICS);

        Log::info('Computing daily analytics snapshot', ['date' => $this->date->format('Y-m-d')]);

        try {
            // Save sales snapshot
            $salesService->saveDailySnapshot($this->date);

            // Save inventory snapshot
            $inventoryService->saveDailySnapshot($this->date);

            $this->jobRun->complete(2, [
                'date' => $this->date->format('Y-m-d'),
                'snapshots' => ['sales', 'inventory'],
            ]);

            Log::info('Daily analytics snapshot completed');
        } catch (\Exception $e) {
            $this->jobRun?->fail($e->getMessage());
            Log::error('Daily analytics job failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        $this->jobRun?->fail($exception->getMessage());

        Log::error('ComputeDailyAnalyticsJob: Job failed after retries', [
            'error' => $exception->getMessage(),
        ]);
    }
}
