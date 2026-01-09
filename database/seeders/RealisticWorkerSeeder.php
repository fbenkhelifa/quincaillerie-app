<?php

namespace Database\Seeders;

use App\Models\Worker;
use Illuminate\Database\Seeder;

class RealisticWorkerSeeder extends Seeder
{
    public function run(): void
    {
        $size = config('demo_seed.size', 'medium');
        $config = config("demo_seed.sizes.{$size}");

        $workers = $this->getWorkers();
        $count = min($config['workers'], count($workers));

        $this->command->info("  👷 Seeding {$count} workers...");

        foreach (array_slice($workers, 0, $count) as $worker) {
            Worker::create($worker);
        }
    }

    private function getWorkers(): array
    {
        return [
            [
                'name' => 'Ahmed Benali',
                'phone' => '0550 11 22 33',
                'role' => 'cashier',
                'is_active' => true,
            ],
            [
                'name' => 'Fatima Zahra Kaci',
                'phone' => '0551 22 33 44',
                'role' => 'cashier',
                'is_active' => true,
            ],
            [
                'name' => 'Mohamed Larbi',
                'phone' => '0552 33 44 55',
                'role' => 'cashier',
                'is_active' => true,
            ],
            [
                'name' => 'Karim Messaoudi',
                'phone' => '0553 44 55 66',
                'role' => 'cashier',
                'is_active' => true,
            ],
            [
                'name' => 'Samira Boudiaf',
                'phone' => '0554 55 66 77',
                'role' => 'manager',
                'is_active' => true,
            ],
            [
                'name' => 'Youcef Hamdi',
                'phone' => '0555 66 77 88',
                'role' => 'warehouse',
                'is_active' => true,
            ],
            [
                'name' => 'Rachid Belmadi',
                'phone' => '0556 77 88 99',
                'role' => 'cashier',
                'is_active' => true,
            ],
            [
                'name' => 'Nadir Ouahab',
                'phone' => '0557 88 99 00',
                'role' => 'warehouse',
                'is_active' => true,
            ],
            [
                'name' => 'Amina Berkane',
                'phone' => '0558 99 00 11',
                'role' => 'cashier',
                'is_active' => true,
            ],
            [
                'name' => 'Said Ferhat',
                'phone' => '0559 00 11 22',
                'role' => 'warehouse',
                'is_active' => true,
            ],
            [
                'name' => 'Lila Meziane',
                'phone' => '0560 11 22 33',
                'role' => 'cashier',
                'is_active' => true,
            ],
            [
                'name' => 'Djamel Ait Kaci',
                'phone' => '0561 22 33 44',
                'role' => 'cashier',
                'is_active' => true,
            ],
        ];
    }
}
