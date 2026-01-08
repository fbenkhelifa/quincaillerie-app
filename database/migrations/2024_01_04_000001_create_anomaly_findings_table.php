<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anomaly_findings', function (Blueprint $table) {
            $table->id();
            
            // Type of anomaly
            $table->string('type', 50); // repeated_cancellation, negative_stock, large_adjustment, high_discount, etc.
            $table->enum('severity', ['critical', 'high', 'medium', 'low'])->default('medium');
            
            // Entity reference (polymorphic)
            $table->string('entity_type', 100)->nullable(); // App\Models\Bill, App\Models\Product, etc.
            $table->unsignedBigInteger('entity_id')->nullable();
            
            // Detection details
            $table->string('title');
            $table->text('explanation');
            $table->json('metadata')->nullable(); // Additional context data
            $table->decimal('impact_value', 14, 2)->nullable(); // Monetary impact if applicable
            
            // Status tracking
            $table->enum('status', ['new', 'investigating', 'resolved', 'dismissed'])->default('new');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('resolution_notes')->nullable();
            
            // Timestamps
            $table->timestamp('detected_at');
            $table->timestamps();
            
            // Indexes
            $table->index('type');
            $table->index('severity');
            $table->index('status');
            $table->index('detected_at');
            $table->index(['entity_type', 'entity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anomaly_findings');
    }
};
