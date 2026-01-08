<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            
            // Who performed the action
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('user_name')->nullable(); // Cached for display
            
            // What action was performed
            $table->string('action', 50); // created, updated, deleted, cancelled, adjusted, received, etc.
            $table->string('event', 100)->nullable(); // Laravel event class name
            
            // On which entity
            $table->string('auditable_type', 100); // Model class name
            $table->unsignedBigInteger('auditable_id');
            $table->string('auditable_label')->nullable(); // Human readable label (e.g., "Facture #F-2024-0042")
            
            // Change details
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->json('metadata')->nullable(); // IP, user agent, additional context
            
            // Context
            $table->string('reason')->nullable(); // Optional reason provided by user
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('user_id');
            $table->index('action');
            $table->index(['auditable_type', 'auditable_id']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
