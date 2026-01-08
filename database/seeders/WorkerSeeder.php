<?php

namespace Database\Seeders;

use App\Models\Worker;
use Illuminate\Database\Seeder;

class WorkerSeeder extends Seeder
{
    public function run(): void
    {
        $workers = [
            [
                'name' => 'Mohamed Belkacem',
                'phone' => '0660 123 456',
                'role' => 'manager',
                'hire_date' => '2020-01-15',
            ],
            [
                'name' => 'Karim Hadj',
                'phone' => '0661 234 567',
                'role' => 'cashier',
                'hire_date' => '2021-03-20',
            ],
            [
                'name' => 'Ahmed Saidi',
                'phone' => '0662 345 678',
                'role' => 'cashier',
                'hire_date' => '2022-06-10',
            ],
            [
                'name' => 'Yacine Bouzid',
                'phone' => '0663 456 789',
                'role' => 'warehouse',
                'hire_date' => '2021-09-05',
            ],
            [
                'name' => 'Omar Cherif',
                'phone' => '0664 567 890',
                'role' => 'warehouse',
                'hire_date' => '2023-01-12',
            ],
        ];

        foreach ($workers as $worker) {
            Worker::create([
                ...$worker,
                'is_active' => true,
            ]);
        }
    }
}
