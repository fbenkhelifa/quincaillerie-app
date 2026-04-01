<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->string('store_name_ar')->nullable()->after('store_name');
            $table->string('owner_name_ar')->nullable()->after('owner_name');
            $table->string('email')->nullable()->after('phone');
            $table->text('address_ar')->nullable()->after('address');
            $table->string('rc_number')->nullable()->after('tax_id');
            $table->string('ai_number')->nullable()->after('rc_number');
            $table->string('nis_number')->nullable()->after('ai_number');
            $table->string('invoice_footer', 500)->nullable()->after('nis_number');
            $table->string('invoice_footer_ar', 500)->nullable()->after('invoice_footer');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn([
                'store_name_ar',
                'owner_name_ar',
                'email',
                'address_ar',
                'rc_number',
                'ai_number',
                'nis_number',
                'invoice_footer',
                'invoice_footer_ar',
            ]);
        });
    }
};
