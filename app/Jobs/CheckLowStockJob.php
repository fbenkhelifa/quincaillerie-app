<?php

namespace App\Jobs;

use App\Models\JobRun;
use App\Models\Notification;
use App\Models\Product;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CheckLowStockJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    /**
     * Execute the job.
     */
    public function handle(NotificationService $notificationService): void
    {
        $jobRun = JobRun::startRun(JobRun::JOB_LOW_STOCK_CHECK, JobRun::GROUP_NOTIFICATION);

        try {
            $notificationsCreated = 0;

            // Find products below reorder level
            $lowStockProducts = Product::where('stock_quantity', '<=', \DB::raw('reorder_level'))
                ->where('stock_quantity', '>', 0)
                ->where('reorder_level', '>', 0)
                ->get();

            foreach ($lowStockProducts as $product) {
                // Check if we already notified about this product today
                $existingNotification = Notification::where('type', Notification::TYPE_LOW_STOCK)
                    ->whereJsonContains('metadata->product_id', $product->id)
                    ->whereDate('created_at', today())
                    ->exists();

                if (!$existingNotification) {
                    $notificationService->notifyLowStock($product);
                    $notificationsCreated++;
                }
            }

            // Find products at critical level (stock = 0 or very low)
            $criticalProducts = Product::where(function ($query) {
                    $query->where('stock_quantity', '<=', 0)
                        ->orWhere('stock_quantity', '<=', \DB::raw('reorder_level * 0.25'));
                })
                ->where('reorder_level', '>', 0)
                ->get();

            foreach ($criticalProducts as $product) {
                // Check if we already notified about this product today
                $existingNotification = Notification::where('type', Notification::TYPE_STOCK_CRITICAL)
                    ->whereJsonContains('metadata->product_id', $product->id)
                    ->whereDate('created_at', today())
                    ->exists();

                if (!$existingNotification) {
                    $notificationService->notifyCriticalStock($product);
                    $notificationsCreated++;
                }
            }

            $jobRun->complete($notificationsCreated, [
                'low_stock_count' => $lowStockProducts->count(),
                'critical_count' => $criticalProducts->count(),
                'notifications_created' => $notificationsCreated,
            ]);

            Log::info('CheckLowStockJob completed', [
                'notifications_created' => $notificationsCreated,
            ]);

        } catch (\Exception $e) {
            $jobRun->fail($e->getMessage());
            Log::error('CheckLowStockJob failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }
}
