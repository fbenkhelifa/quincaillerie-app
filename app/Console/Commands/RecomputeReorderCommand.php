<?php

namespace App\Console\Commands;

use App\Jobs\ComputeReorderSuggestionsJob;
use App\Services\Replenishment\ReorderCalculationService;
use Illuminate\Console\Command;

class RecomputeReorderCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'inventory:recompute-reorder 
                            {--sync : Run synchronously instead of queuing}
                            {--product= : Compute for a specific product ID only}';

    /**
     * The console command description.
     */
    protected $description = 'Recompute reorder suggestions based on demand forecasting';

    /**
     * Execute the console command.
     */
    public function handle(ReorderCalculationService $service): int
    {
        $this->info('🔄 Starting reorder suggestion computation...');

        $productId = $this->option('product');
        $sync = $this->option('sync');

        if ($productId) {
            return $this->handleSingleProduct($service, (int) $productId);
        }

        if ($sync) {
            return $this->handleSync($service);
        }

        return $this->handleQueued();
    }

    /**
     * Compute for a single product (always sync).
     */
    protected function handleSingleProduct(ReorderCalculationService $service, int $productId): int
    {
        $product = \App\Models\Product::find($productId);

        if (!$product) {
            $this->error("Product with ID {$productId} not found.");
            return self::FAILURE;
        }

        $this->info("Computing suggestion for: {$product->name} (ID: {$productId})");

        $suggestion = $service->computeForProduct($product);

        if (!$suggestion) {
            $this->info('✅ No reorder needed for this product.');
            return self::SUCCESS;
        }

        $this->table(
            ['Field', 'Value'],
            [
                ['Current Stock', $suggestion['current_stock']],
                ['Reorder Point', $suggestion['reorder_point']],
                ['Safety Stock', $suggestion['safety_stock']],
                ['Avg Daily Demand', $suggestion['avg_daily_demand']],
                ['Recommended Qty', $suggestion['recommended_qty']],
                ['Urgency', $suggestion['urgency']],
                ['Confidence', $suggestion['confidence'] . '%'],
                ['Stockout Date', $suggestion['projected_stockout_date']?->format('Y-m-d') ?? 'N/A'],
            ]
        );

        if ($this->confirm('Save this suggestion to the database?')) {
            $service->saveAllSuggestions([$suggestion]);
            $this->info('✅ Suggestion saved.');
        }

        return self::SUCCESS;
    }

    /**
     * Run computation synchronously.
     */
    protected function handleSync(ReorderCalculationService $service): int
    {
        $this->info('Running synchronously...');

        $startTime = microtime(true);

        $suggestions = $service->computeAllSuggestions();

        $this->info(sprintf('Computed %d suggestions.', count($suggestions)));

        if (empty($suggestions)) {
            $this->info('✅ No products need reordering at this time.');
            return self::SUCCESS;
        }

        // Show summary
        $urgencyCounts = collect($suggestions)->groupBy('urgency')->map->count();

        $this->table(
            ['Urgency', 'Count'],
            $urgencyCounts->map(fn($count, $urgency) => [$urgency, $count])->values()->toArray()
        );

        $savedCount = $service->saveAllSuggestions($suggestions);

        $elapsed = round(microtime(true) - $startTime, 2);

        $this->info("✅ Saved {$savedCount} suggestions in {$elapsed}s.");

        return self::SUCCESS;
    }

    /**
     * Dispatch job to queue.
     */
    protected function handleQueued(): int
    {
        ComputeReorderSuggestionsJob::dispatch();

        $this->info('✅ Job dispatched to queue.');
        $this->info('Run "php artisan queue:work" to process the job.');

        return self::SUCCESS;
    }
}
