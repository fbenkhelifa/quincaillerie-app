<?php

namespace Database\Factories;

use App\Models\Bill;
use App\Models\Worker;
use Illuminate\Database\Eloquent\Factories\Factory;

class BillFactory extends Factory
{
    protected $model = Bill::class;

    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 500, 50000);
        $discount = $this->faker->randomFloat(2, 0, $subtotal * 0.1);
        $tax = $this->faker->randomFloat(2, 0, $subtotal * 0.05);

        return [
            'bill_number' => 'FAC-' . date('Y') . '-' . str_pad($this->faker->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'worker_id' => Worker::factory(),
            'customer_name' => $this->faker->optional()->name(),
            'customer_phone' => $this->faker->optional()->phoneNumber(),
            'subtotal' => $subtotal,
            'discount' => $discount,
            'tax' => $tax,
            'total' => $subtotal - $discount + $tax,
            'payment_method' => $this->faker->randomElement(['cash', 'card', 'check', 'credit', 'other']),
            'status' => 'completed',
            'notes' => $this->faker->optional()->sentence(),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }

    public function cash(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_method' => 'cash',
        ]);
    }

    public function credit(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_method' => 'credit',
        ]);
    }
}
