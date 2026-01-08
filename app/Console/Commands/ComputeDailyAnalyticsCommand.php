<?php

namespace App\Console\Commands;

use App\Jobs\ComputeDailyAnalyticsJob;
use Illuminate\Console\Command;

class ComputeDailyAnalyticsCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'analytics:compute-daily {--date= : Specific date to compute (Y-m-d format)}';

    /**
     * The console command description.
     */
    protected $description = 'Compute daily analytics aggregates and snapshots';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $date = $this->option('date') 
            ? \Carbon\Carbon::parse($this->option('date'))
            : now()->subDay();

        $this->info("Computing analytics for: {$date->format('Y-m-d')}");

        ComputeDailyAnalyticsJob::dispatch($date);

        $this->info('Job dispatched successfully.');

        return Command::SUCCESS;
    }
}
