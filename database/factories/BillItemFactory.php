<?php

namespace Database\Factories;

use App\Models\Bill;
use App\Models\BillItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class BillItemFactory extends Factory
{
    protected $model = BillItem::class;

    public function definition(): array
    {
        $quantity = $this->faker->numberBetween(1, 20);
        $unitPrice = $this->faker->randomFloat(2, 100, 5000);
        $discount = $this->faker->randomFloat(2, 0, $unitPrice * 0.1);

        return [
            'bill_id' => Bill::factory(),
            'product_id' => Product::factory(),
            'product_name' => $this->faker->word() . ' Product',
            'product_sku' => strtoupper($this->faker->bothify('???-####')),
            'quantity' => $quantity,
            'unit' => $this->faker->randomElement(['pièce', 'kg', 'mètre', 'litre']),
            'unit_price' => $unitPrice,
            'discount' => $discount,
            'total' => ($quantity * $unitPrice) - $discount,
        ];
    }
}
