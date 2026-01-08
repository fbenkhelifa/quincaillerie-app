<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reorder_suggestions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('suggested_supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->decimal('recommended_qty', 12, 2);
            $table->decimal('current_stock', 12, 2);
            $table->decimal('min_stock', 12, 2)->nullable();
            $table->decimal('reorder_point', 12, 2);
            $table->decimal('safety_stock', 12, 2);
            $table->decimal('avg_daily_demand', 12, 4);
            $table->decimal('forecasted_demand_30d', 12, 2)->nullable();
            $table->integer('lead_time_days')->default(7);
            $table->date('projected_stockout_date')->nullable();
            $table->decimal('confidence', 5, 2)->default(0); // 0-100%
            $table->enum('urgency', ['critical', 'high', 'medium', 'low'])->default('medium');
            $table->json('reason_json'); // structured explanation
            $table->json('forecast_data')->nullable(); // historical + projected data for charts
            $table->enum('status', ['pending', 'approved', 'dismissed', 'ordered'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('purchase_order_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('computed_at');
            $table->timestamps();

            $table->index('status');
            $table->index('urgency');
            $table->index('confidence');
            $table->index('projected_stockout_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reorder_suggestions');
    }
};
