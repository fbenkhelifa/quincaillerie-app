<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $size = config('demo_seed.size', 'medium');
        $config = config("demo_seed.sizes.{$size}");

        $this->command->info("🌱 Seeding database with '{$size}' dataset...");
        $this->command->info("   Products: {$config['products']}, Bills: {$config['bills']}, POs: {$config['purchase_orders']}");
        $this->command->newLine();

        // Use fixed seed for reproducibility
        srand(2025);
        mt_srand(2025);

        // Disable foreign key checks for faster inserts
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        $this->call([
            SettingsSeeder::class,
            UserSeeder::class,
            CategorySeeder::class,
            RealisticSupplierSeeder::class,
            RealisticWorkerSeeder::class,
            RealisticProductSeeder::class,
            RealisticBillSeeder::class,
            RealisticPurchaseOrderSeeder::class,
            RealisticAnomalySeeder::class,
            OpsNotificationSeeder::class,
        ]);

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->newLine();
        $this->command->info('✅ Database seeding completed!');
        $this->printSummary();
    }

    private function printSummary(): void
    {
        $this->command->newLine();
        $this->command->info('📊 Data Summary:');
        $this->command->table(
            ['Table', 'Records'],
            [
                ['users', \App\Models\User::count()],
                ['categories', \App\Models\Category::count()],
                ['suppliers', \App\Models\Supplier::count()],
                ['workers', \App\Models\Worker::count()],
                ['products', \App\Models\Product::count()],
                ['bills', \App\Models\Bill::count()],
                ['bill_items', \App\Models\BillItem::count()],
                ['inventory_movements', \App\Models\InventoryMovement::count()],
                ['purchase_orders', \App\Models\PurchaseOrder::count()],
                ['purchase_order_items', \App\Models\PurchaseOrderItem::count()],
                ['anomaly_findings', \App\Models\AnomalyFinding::count()],
                ['notifications', \App\Models\Notification::count()],
                ['reorder_suggestions', \App\Models\ReorderSuggestion::count()],
            ]
        );
    }
}
