<?php

namespace App\Console\Commands;

use App\Jobs\CheckLowStockJob;
use Illuminate\Console\Command;

class CheckLowStockCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'notifications:check-low-stock';

    /**
     * The console command description.
     */
    protected $description = 'Check for low stock products and send notifications';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking for low stock products...');

        CheckLowStockJob::dispatch();

        $this->info('Job dispatched successfully.');

        return Command::SUCCESS;
    }
}
