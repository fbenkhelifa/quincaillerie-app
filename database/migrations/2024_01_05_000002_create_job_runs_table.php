<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('job_runs', function (Blueprint $table) {
            $table->id();
            $table->string('job_name'); // e.g., 'reorder_suggestions', 'analytics_aggregates', 'anomaly_detection', 'low_stock_check'
            $table->string('job_group', 50)->default('default'); // Group: 'reorder', 'analytics', 'anomaly', 'notification'
            $table->string('status', 20); // pending, running, completed, failed
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->integer('items_processed')->default(0);
            $table->text('error_message')->nullable();
            $table->json('metadata')->nullable(); // Stats, counts, etc.
            $table->timestamps();

            $table->index(['job_name', 'started_at']);
            $table->index(['job_group', 'status']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_runs');
    }
};
