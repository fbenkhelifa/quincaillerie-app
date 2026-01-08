<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = [
            [
                'name' => 'Fournisseur National',
                'contact_name' => 'Ahmed Kaddour',
                'email' => 'contact@fournisseur-national.dz',
                'phone' => '0550 111 222',
                'address' => '45 Zone Industrielle, Rouiba',
                'city' => 'Alger',
            ],
            [
                'name' => 'Import Outillage',
                'contact_name' => 'Karim Meziane',
                'email' => 'info@import-outillage.dz',
                'phone' => '0551 333 444',
                'address' => '12 Rue du Commerce',
                'city' => 'Oran',
            ],
            [
                'name' => 'Grossiste Plomberie',
                'contact_name' => 'Youcef Boudiaf',
                'email' => 'vente@grossiste-plomberie.dz',
                'phone' => '0552 555 666',
                'address' => '78 Boulevard des Affaires',
                'city' => 'Constantine',
            ],
            [
                'name' => 'Électro Distribution',
                'contact_name' => 'Sofiane Larbi',
                'email' => 'commandes@electro-dist.dz',
                'phone' => '0553 777 888',
                'address' => '23 Avenue de l\'Industrie',
                'city' => 'Blida',
            ],
            [
                'name' => 'Peintures Pro',
                'contact_name' => 'Rachid Hamidi',
                'email' => 'pro@peintures-pro.dz',
                'phone' => '0554 999 000',
                'address' => '56 Rue des Artisans',
                'city' => 'Sétif',
            ],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::create([
                ...$supplier,
                'is_active' => true,
            ]);
        }
    }
}
