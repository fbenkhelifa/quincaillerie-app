<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::create([
            'name' => 'Admin',
            'email' => 'a@a.a',
            'password' => Hash::make('123'),
            'role' => 'admin',
            'preferred_locale' => 'fr',
            'preferred_theme' => 'light',
        ]);

        // Cashier user
        User::create([
            'name' => 'Caissier',
            'email' => 'c@c.c',
            'password' => Hash::make('123'),
            'role' => 'cashier',
            'preferred_locale' => 'fr',
            'preferred_theme' => 'light',
        ]);

        // Viewer user
        User::create([
            'name' => 'Visiteur',
            'email' => 'v@v.v',
            'password' => Hash::make('123'),
            'role' => 'viewer',
            'preferred_locale' => 'fr',
            'preferred_theme' => 'light',
        ]);
    }
}
