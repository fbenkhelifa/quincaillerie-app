<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Performance indexes for dashboard analytics queries.
     */
    public function up(): void
    {
        // Bills table indexes for filtering and aggregation
        $this->addIndexIfNotExists('bills', 'bills_status_created_at_idx', ['status', 'created_at']);
        $this->addIndexIfNotExists('bills', 'bills_worker_created_at_idx', ['worker_id', 'created_at']);
        $this->addIndexIfNotExists('bills', 'bills_payment_method_created_at_idx', ['payment_method', 'created_at']);

        // Bill items for top products chart
        $this->addIndexIfNotExists('bill_items', 'bill_items_product_created_at_idx', ['product_id', 'created_at']);

        // Products for stock risk analysis
        $this->addIndexIfNotExists('products', 'products_stock_analysis_idx', ['category_id', 'quantity', 'min_stock']);

        // Inventory movements for timeline
        $this->addIndexIfNotExists('inventory_movements', 'inventory_movements_type_created_at_idx', ['type', 'created_at']);
        $this->addIndexIfNotExists('inventory_movements', 'inventory_movements_product_type_date_idx', ['product_id', 'type', 'created_at']);

        // Anomaly findings if table exists
        if (Schema::hasTable('anomaly_findings')) {
            $this->addIndexIfNotExists('anomaly_findings', 'anomaly_findings_severity_status_date_idx', ['severity', 'status', 'created_at']);
        }

        // Reorder suggestions if table exists
        if (Schema::hasTable('reorder_suggestions')) {
            $this->addIndexIfNotExists('reorder_suggestions', 'reorder_suggestions_status_urgency_idx', ['status', 'urgency']);
        }
    }

    /**
     * Add an index only if it doesn't already exist.
     */
    protected function addIndexIfNotExists(string $table, string $indexName, array $columns): void
    {
        $exists = DB::selectOne(
            "SELECT COUNT(*) as cnt FROM information_schema.statistics 
             WHERE table_schema = DATABASE() 
             AND table_name = ? 
             AND index_name = ?",
            [$table, $indexName]
        );

        if ($exists && $exists->cnt == 0) {
            Schema::table($table, function (Blueprint $t) use ($indexName, $columns) {
                $t->index($columns, $indexName);
            });
        }
    }

    /**
     * Drop an index only if it exists.
     */
    protected function dropIndexIfExists(string $table, string $indexName): void
    {
        $exists = DB::selectOne(
            "SELECT COUNT(*) as cnt FROM information_schema.statistics 
             WHERE table_schema = DATABASE() 
             AND table_name = ? 
             AND index_name = ?",
            [$table, $indexName]
        );

        if ($exists && $exists->cnt > 0) {
            Schema::table($table, function (Blueprint $t) use ($indexName) {
                $t->dropIndex($indexName);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $this->dropIndexIfExists('bills', 'bills_status_created_at_idx');
        $this->dropIndexIfExists('bills', 'bills_worker_created_at_idx');
        $this->dropIndexIfExists('bills', 'bills_payment_method_created_at_idx');
        $this->dropIndexIfExists('bill_items', 'bill_items_product_created_at_idx');
        $this->dropIndexIfExists('products', 'products_stock_analysis_idx');
        $this->dropIndexIfExists('inventory_movements', 'inventory_movements_type_created_at_idx');
        $this->dropIndexIfExists('inventory_movements', 'inventory_movements_product_type_date_idx');
        $this->dropIndexIfExists('anomaly_findings', 'anomaly_findings_severity_status_date_idx');
        $this->dropIndexIfExists('reorder_suggestions', 'reorder_suggestions_status_urgency_idx');
    }
};
