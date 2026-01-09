<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class RealisticSupplierSeeder extends Seeder
{
    public function run(): void
    {
        $size = config('demo_seed.size', 'medium');
        $config = config("demo_seed.sizes.{$size}");

        $suppliers = $this->getSuppliers();
        $count = min($config['suppliers'], count($suppliers));

        $this->command->info("  📦 Seeding {$count} suppliers...");

        foreach (array_slice($suppliers, 0, $count) as $supplier) {
            Supplier::create([
                ...$supplier,
                'is_active' => true,
            ]);
        }
    }

    private function getSuppliers(): array
    {
        return [
            // Major national suppliers
            [
                'name' => 'SARL Quincaillerie El-Hadj',
                'contact_name' => 'Hadj Mohamed Benali',
                'email' => 'contact@quincaillerie-elhadj.dz',
                'phone' => '023 45 67 89',
                'address' => '12 Zone Industrielle Oued Smar',
                'city' => 'Alger',
            ],
            [
                'name' => 'EURL Outillage Pro',
                'contact_name' => 'Karim Meziane',
                'email' => 'commandes@outillage-pro.dz',
                'phone' => '021 34 56 78',
                'address' => '45 Route de l\'Aéroport',
                'city' => 'Alger',
            ],
            [
                'name' => 'SPA Import-Export Bâtiment',
                'contact_name' => 'Youcef Bouderbala',
                'email' => 'ventes@import-batiment.dz',
                'phone' => '041 23 45 67',
                'address' => '78 Boulevard Front de Mer',
                'city' => 'Oran',
            ],
            [
                'name' => 'Grossiste Plomberie Constantine',
                'contact_name' => 'Ahmed Khelifi',
                'email' => 'info@plomberie-constantine.dz',
                'phone' => '031 89 01 23',
                'address' => '23 Rue Didouche Mourad',
                'city' => 'Constantine',
            ],
            [
                'name' => 'Électro Distribution Algérie',
                'contact_name' => 'Sofiane Larbi',
                'email' => 'pro@electro-dz.com',
                'phone' => '025 67 89 01',
                'address' => '56 Zone Artisanale',
                'city' => 'Blida',
            ],
            [
                'name' => 'SARL Peintures du Sud',
                'contact_name' => 'Rachid Hamidi',
                'email' => 'contact@peintures-sud.dz',
                'phone' => '036 12 34 56',
                'address' => '89 Avenue de l\'Industrie',
                'city' => 'Sétif',
            ],
            [
                'name' => 'Acier & Métaux Annaba',
                'contact_name' => 'Farid Bouazza',
                'email' => 'vente@acier-annaba.dz',
                'phone' => '038 78 90 12',
                'address' => '34 Zone Industrielle El-Bouni',
                'city' => 'Annaba',
            ],
            [
                'name' => 'EURL Matériaux Modernes',
                'contact_name' => 'Nabil Tlemcani',
                'email' => 'info@materiaux-modernes.dz',
                'phone' => '043 45 67 89',
                'address' => '67 Rue des Frères Cheikh',
                'city' => 'Tlemcen',
            ],
            [
                'name' => 'Visserie Express',
                'contact_name' => 'Omar Belkadi',
                'email' => 'express@visserie-dz.com',
                'phone' => '027 56 78 90',
                'address' => '12 Cité Industrielle',
                'city' => 'Batna',
            ],
            [
                'name' => 'SPA Serrurerie Nationale',
                'contact_name' => 'Amar Djellali',
                'email' => 'contact@serrurerie-nat.dz',
                'phone' => '029 01 23 45',
                'address' => '78 Zone Franche',
                'city' => 'Béjaïa',
            ],
            // Medium suppliers
            [
                'name' => 'SARL Jardinage & Espaces Verts',
                'contact_name' => 'Moussa Belhadj',
                'email' => 'jardin@espaces-verts.dz',
                'phone' => '045 23 45 67',
                'address' => '45 Route de Tipaza',
                'city' => 'Tipaza',
            ],
            [
                'name' => 'Sécurité Pro Algérie',
                'contact_name' => 'Khaled Mansouri',
                'email' => 'contact@securite-pro.dz',
                'phone' => '021 78 90 12',
                'address' => '23 Rue Larbi Ben M\'hidi',
                'city' => 'Alger',
            ],
            [
                'name' => 'EURL Tools Master',
                'contact_name' => 'Samir Ouali',
                'email' => 'master@tools-dz.com',
                'phone' => '041 56 78 90',
                'address' => '89 Avenue 1er Novembre',
                'city' => 'Oran',
            ],
            [
                'name' => 'Fixation & Ancrage SARL',
                'contact_name' => 'Bilal Aoudia',
                'email' => 'commandes@fixation-dz.com',
                'phone' => '025 12 34 56',
                'address' => '34 Zone Industrielle Bouinan',
                'city' => 'Blida',
            ],
            [
                'name' => 'Hydra Sanitaire',
                'contact_name' => 'Tarek Bensaid',
                'email' => 'info@hydra-sanitaire.dz',
                'phone' => '023 67 89 01',
                'address' => '56 Rue Mohamed Belouizdad',
                'city' => 'Alger',
            ],
            // Smaller regional suppliers
            [
                'name' => 'Comptoir Électrique de l\'Est',
                'contact_name' => 'Djamel Ferhat',
                'email' => 'comptoir@electrique-est.dz',
                'phone' => '031 34 56 78',
                'address' => '12 Rue Abane Ramdane',
                'city' => 'Constantine',
            ],
            [
                'name' => 'Bricolage Plus Oran',
                'contact_name' => 'Redouane Zoubiri',
                'email' => 'plus@bricolage-oran.dz',
                'phone' => '041 89 01 23',
                'address' => '78 Bd de la Soummam',
                'city' => 'Oran',
            ],
            [
                'name' => 'SARL Bâti-Services',
                'contact_name' => 'Hakim Benmalek',
                'email' => 'services@bati-dz.com',
                'phone' => '036 45 67 89',
                'address' => '45 Route de Biskra',
                'city' => 'Sétif',
            ],
            [
                'name' => 'Quincaillerie Centrale Tizi',
                'contact_name' => 'Mohand Ait Yahia',
                'email' => 'centrale@quinc-tizi.dz',
                'phone' => '026 23 45 67',
                'address' => '23 Rue Colonel Amirouche',
                'city' => 'Tizi Ouzou',
            ],
            [
                'name' => 'Pro-Matériaux Chlef',
                'contact_name' => 'Azzedine Bouchemal',
                'email' => 'pro@materiaux-chlef.dz',
                'phone' => '027 78 90 12',
                'address' => '89 Zone d\'Activité',
                'city' => 'Chlef',
            ],
            // International import suppliers (longer lead times)
            [
                'name' => 'China Tools Import SARL',
                'contact_name' => 'Lin Wei / Faouzi Mebarek',
                'email' => 'algerie@chinatools-import.com',
                'phone' => '021 11 22 33',
                'address' => '10 Port d\'Alger, Zone Import',
                'city' => 'Alger',
            ],
            [
                'name' => 'Euro-Outillage EURL',
                'contact_name' => 'Pierre Dupont / Kamel Bensalah',
                'email' => 'algerie@euro-outillage.eu',
                'phone' => '021 44 55 66',
                'address' => '5 Bd Zighout Youcef',
                'city' => 'Alger',
            ],
            [
                'name' => 'Turkish Hardware Trading',
                'contact_name' => 'Mehmet Özkan / Hichem Bourahla',
                'email' => 'algeria@turkish-hardware.com',
                'phone' => '021 77 88 99',
                'address' => '15 Zone Portuaire Djen Djen',
                'city' => 'Jijel',
            ],
            [
                'name' => 'MedBuild International',
                'contact_name' => 'Antonio Ferrara / Yassine Hadjadj',
                'email' => 'dz@medbuild-int.com',
                'phone' => '041 22 33 44',
                'address' => '8 Port d\'Oran',
                'city' => 'Oran',
            ],
            // Specialty suppliers
            [
                'name' => 'Ventilation & Climatisation DZ',
                'contact_name' => 'Said Aissaoui',
                'email' => 'info@ventilclim-dz.com',
                'phone' => '023 55 66 77',
                'address' => '67 Rue des Industries',
                'city' => 'Alger',
            ],
            [
                'name' => 'Pompes & Compresseurs Algérie',
                'contact_name' => 'Lotfi Guermaz',
                'email' => 'contact@pompes-dz.com',
                'phone' => '031 88 99 00',
                'address' => '34 Zone Industrielle Didouche Mourad',
                'city' => 'Constantine',
            ],
            [
                'name' => 'Abrasifs & Meules Pro',
                'contact_name' => 'Toufik Sellami',
                'email' => 'vente@abrasifs-pro.dz',
                'phone' => '025 33 44 55',
                'address' => '12 Route de Médéa',
                'city' => 'Blida',
            ],
            [
                'name' => 'Éclairage LED Algérie',
                'contact_name' => 'Hocine Benamara',
                'email' => 'led@eclairage-dz.com',
                'phone' => '021 66 77 88',
                'address' => '56 Cité 5 Juillet',
                'city' => 'Alger',
            ],
            [
                'name' => 'Cable & Fil d\'Or',
                'contact_name' => 'Abdelkader Meghaoui',
                'email' => 'info@cable-fildor.dz',
                'phone' => '036 99 00 11',
                'address' => '78 Zone Industrielle',
                'city' => 'Bordj Bou Arreridj',
            ],
            [
                'name' => 'Joints & Étanchéité SARL',
                'contact_name' => 'Walid Bouzid',
                'email' => 'contact@joints-etancheite.dz',
                'phone' => '038 11 22 33',
                'address' => '23 Rue El-Mokrani',
                'city' => 'Annaba',
            ],
        ];
    }
}
