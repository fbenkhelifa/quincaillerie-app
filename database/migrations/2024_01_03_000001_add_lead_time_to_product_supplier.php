<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_supplier', function (Blueprint $table) {
            $table->unsignedInteger('lead_time_days')->default(7)->after('is_primary');
        });
    }

    public function down(): void
    {
        Schema::table('product_supplier', function (Blueprint $table) {
            $table->dropColumn('lead_time_days');
        });
    }
};
