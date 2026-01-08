<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        Setting::create([
            'store_name' => 'Quincaillerie El Baraka',
            'owner_name' => 'Mohamed Benali',
            'phone' => '0555 123 456',
            'address' => '123 Rue des Artisans, Alger 16000',
            'default_locale' => 'fr',
            'default_theme' => 'light',
            'currency' => 'DZD',
            'tax_id' => '000123456789',
        ]);
    }
}
