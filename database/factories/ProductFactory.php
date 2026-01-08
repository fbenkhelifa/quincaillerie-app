<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $products = [
            'Marteau', 'Tournevis', 'Clé à molette', 'Perceuse', 'Scie',
            'Pince', 'Mètre ruban', 'Niveau à bulle', 'Vis', 'Clou',
            'Boulon', 'Écrou', 'Tuyau PVC', 'Robinet', 'Câble électrique',
        ];
        
        $name = $this->faker->randomElement($products) . ' ' . $this->faker->word();
        $costPrice = $this->faker->randomFloat(2, 50, 5000);
        $margin = $this->faker->randomFloat(2, 0.15, 0.50);

        return [
            'name' => $name,
            'name_ar' => null,
            'sku' => strtoupper(Str::random(3)) . '-' . $this->faker->unique()->numberBetween(1000, 9999),
            'barcode' => $this->faker->optional()->ean13(),
            'description' => $this->faker->optional()->sentence(),
            'category_id' => Category::factory(),
            'cost_price' => $costPrice,
            'selling_price' => round($costPrice * (1 + $margin), 2),
            'quantity' => $this->faker->numberBetween(0, 500),
            'min_quantity' => $this->faker->numberBetween(5, 20),
            'unit' => $this->faker->randomElement(['pièce', 'kg', 'mètre', 'litre', 'boîte']),
            'image_url' => null,
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function lowStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'quantity' => $this->faker->numberBetween(1, 5),
            'min_quantity' => 10,
        ]);
    }

    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'quantity' => 0,
        ]);
    }
}
