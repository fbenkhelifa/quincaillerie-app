<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add min_order_qty to product_supplier (lead_time_days already added in earlier migration)
        if (!Schema::hasColumn('product_supplier', 'min_order_qty')) {
            Schema::table('product_supplier', function (Blueprint $table) {
                $table->decimal('min_order_qty', 12, 2)->nullable()->after('lead_time_days');
            });
        }

        // Add default lead time to suppliers table
        if (!Schema::hasColumn('suppliers', 'default_lead_time_days')) {
            Schema::table('suppliers', function (Blueprint $table) {
                $table->integer('default_lead_time_days')->default(7)->after('notes');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('product_supplier', 'min_order_qty')) {
            Schema::table('product_supplier', function (Blueprint $table) {
                $table->dropColumn('min_order_qty');
            });
        }

        if (Schema::hasColumn('suppliers', 'default_lead_time_days')) {
            Schema::table('suppliers', function (Blueprint $table) {
                $table->dropColumn('default_lead_time_days');
            });
        }
    }
};
