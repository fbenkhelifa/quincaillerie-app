<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Outillage à main', 'name_ar' => 'أدوات يدوية'],
            ['name' => 'Outillage électrique', 'name_ar' => 'أدوات كهربائية'],
            ['name' => 'Plomberie', 'name_ar' => 'سباكة'],
            ['name' => 'Électricité', 'name_ar' => 'كهرباء'],
            ['name' => 'Peinture', 'name_ar' => 'دهان'],
            ['name' => 'Quincaillerie générale', 'name_ar' => 'مواد بناء عامة'],
            ['name' => 'Fixation', 'name_ar' => 'تثبيت'],
            ['name' => 'Serrurerie', 'name_ar' => 'أقفال'],
            ['name' => 'Jardinage', 'name_ar' => 'بستنة'],
            ['name' => 'Sécurité', 'name_ar' => 'أمان'],
        ];

        foreach ($categories as $index => $category) {
            Category::create([
                'name' => $category['name'],
                'name_ar' => $category['name_ar'],
                'slug' => Str::slug($category['name']),
                'sort_order' => $index,
                'is_active' => true,
            ]);
        }
    }
}
