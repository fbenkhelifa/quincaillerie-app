<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        $categories = [
            ['name' => 'Outillage', 'name_ar' => 'أدوات'],
            ['name' => 'Plomberie', 'name_ar' => 'السباكة'],
            ['name' => 'Électricité', 'name_ar' => 'الكهرباء'],
            ['name' => 'Quincaillerie', 'name_ar' => 'الأدوات المعدنية'],
            ['name' => 'Peinture', 'name_ar' => 'الطلاء'],
        ];
        
        $category = $this->faker->randomElement($categories);

        return [
            'name' => $category['name'] . ' ' . $this->faker->unique()->numberBetween(1, 100),
            'name_ar' => $category['name_ar'],
            'description' => $this->faker->sentence(),
        ];
    }
}
