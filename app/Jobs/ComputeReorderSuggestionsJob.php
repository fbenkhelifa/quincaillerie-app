<?php

namespace App\Jobs;

use App\Services\Replenishment\ReorderCalculationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ComputeReorderSuggestionsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 300;

    /**
     * Execute the job.
     */
    public function handle(ReorderCalculationService $service): void
    {
        Log::info('ComputeReorderSuggestionsJob: Starting reorder suggestion computation');

        $startTime = microtime(true);

        try {
            // Compute suggestions for all products
            $suggestions = $service->computeAllSuggestions();

            Log::info('ComputeReorderSuggestionsJob: Computed suggestions', [
                'count' => count($suggestions),
            ]);

            // Save to database
            $savedCount = $service->saveAllSuggestions($suggestions);

            $elapsed = round(microtime(true) - $startTime, 2);

            Log::info('ComputeReorderSuggestionsJob: Completed', [
                'saved_count' => $savedCount,
                'elapsed_seconds' => $elapsed,
            ]);

        } catch (\Exception $e) {
            Log::error('ComputeReorderSuggestionsJob: Failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('ComputeReorderSuggestionsJob: Job failed after retries', [
            'error' => $exception->getMessage(),
        ]);
    }
}
