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
| To run the scheduler in development:
|   php artisan schedule:work
|
| In production, add this cron entry:
|   * * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
|
*/

// Recompute reorder suggestions every night at 2 AM
Schedule::command('inventory:recompute-reorder')
    ->dailyAt('02:00')
    ->withoutOverlapping()
    ->runInBackground()
    ->description('Compute reorder suggestions based on demand forecast');
