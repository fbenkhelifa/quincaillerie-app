<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled Tasks
|--------------------------------------------------------------------------
|
| Here you may define all of your scheduled tasks. The scheduler will
| run these tasks at the appropriate intervals.
|
| To run the scheduler in development (Laragon):
|   php artisan schedule:work
|
| To process queued jobs in development (Laragon):
|   php artisan queue:work --tries=3
|
| In production, add this cron entry:
|   * * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
|
*/

// ============================================================
// Nightly Jobs (2:00 AM - 4:00 AM)
// ============================================================

// Recompute reorder suggestions every night at 2:00 AM
Schedule::command('inventory:recompute-reorder')
    ->dailyAt('02:00')
    ->withoutOverlapping()
    ->runInBackground()
    ->onSuccess(function () {
        \Log::info('Scheduled: inventory:recompute-reorder completed');
    })
    ->onFailure(function () {
        \Log::error('Scheduled: inventory:recompute-reorder failed');
    })
    ->description('Compute reorder suggestions based on demand forecast');

// Compute daily analytics snapshots at 2:30 AM
Schedule::command('analytics:compute-daily')
    ->dailyAt('02:30')
    ->withoutOverlapping()
    ->runInBackground()
    ->onSuccess(function () {
        \Log::info('Scheduled: analytics:compute-daily completed');
    })
    ->onFailure(function () {
        \Log::error('Scheduled: analytics:compute-daily failed');
    })
    ->description('Compute daily sales and inventory analytics');

// Run anomaly detection at 3:00 AM
Schedule::command('anomalies:detect')
    ->dailyAt('03:00')
    ->withoutOverlapping()
    ->runInBackground()
    ->onSuccess(function () {
        \Log::info('Scheduled: anomalies:detect completed');
    })
    ->onFailure(function () {
        \Log::error('Scheduled: anomalies:detect failed');
    })
    ->description('Detect anomalies in transactions and inventory');

// ============================================================
// Frequent Jobs (Every few hours)
// ============================================================

// Check for low stock and send notifications every 6 hours
Schedule::command('notifications:check-low-stock')
    ->everySixHours()
    ->withoutOverlapping()
    ->runInBackground()
    ->onSuccess(function () {
        \Log::info('Scheduled: notifications:check-low-stock completed');
    })
    ->onFailure(function () {
        \Log::error('Scheduled: notifications:check-low-stock failed');
    })
    ->description('Check for low stock products and generate notifications');

// ============================================================
// Maintenance Jobs
// ============================================================

// Prune old job runs weekly (keep last 30 days)
Schedule::call(function () {
    \App\Models\JobRun::where('created_at', '<', now()->subDays(30))->delete();
    \Log::info('Scheduled: Pruned old job runs');
})->weekly()
    ->sundays()
    ->at('04:00')
    ->description('Prune old job run records');

// Mark old notifications as read weekly
Schedule::call(function () {
    \App\Models\Notification::where('created_at', '<', now()->subDays(90))
        ->whereNull('read_at')
        ->update(['read_at' => now()]);
    \Log::info('Scheduled: Marked old notifications as read');
})->weekly()
    ->sundays()
    ->at('04:30')
    ->description('Auto-mark old notifications as read');
