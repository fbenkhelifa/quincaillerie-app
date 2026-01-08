<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->string('sku')->unique()->nullable();
            $table->string('barcode')->nullable()->index();
            $table->text('description')->nullable();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('purchase_price', 12, 2)->default(0);
            $table->decimal('selling_price', 12, 2)->default(0);
            $table->decimal('quantity', 12, 2)->default(0);
            $table->string('unit', 20)->default('pièce');
            $table->decimal('min_stock', 12, 2)->default(0);
            $table->string('location')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('name');
            $table->index('is_active');
            $table->index('quantity');
            $table->index(['quantity', 'min_stock']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
