<?php

namespace App\Console\Commands;

use App\Jobs\DetectAnomaliesJob;
use Illuminate\Console\Command;

class DetectAnomaliesCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'anomalies:detect {--date= : Specific date to analyze (Y-m-d format)}';

    /**
     * The console command description.
     */
    protected $description = 'Run anomaly detection on transactions and inventory';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $date = $this->option('date') 
            ? \Carbon\Carbon::parse($this->option('date'))
            : now();

        $this->info("Running anomaly detection for: {$date->format('Y-m-d')}");

        DetectAnomaliesJob::dispatch($date);

        $this->info('Job dispatched successfully.');

        return Command::SUCCESS;
    }
}
