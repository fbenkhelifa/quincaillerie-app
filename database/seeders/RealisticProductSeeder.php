<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class RealisticProductSeeder extends Seeder
{
    public function run(): void
    {
        $size = config('demo_seed.size', 'medium');
        $config = config("demo_seed.sizes.{$size}");
        $targetCount = $config['products'];

        $this->command->info("  📦 Seeding {$targetCount} products...");

        $categories = Category::all()->keyBy('name');
        $suppliers = Supplier::all();

        $baseProducts = $this->getBaseProducts();
        
        // Create base products first
        $created = 0;
        foreach ($baseProducts as $productData) {
            if ($created >= $targetCount) break;
            
            $category = $categories->get($productData['category']);
            if (!$category) continue;

            $product = Product::create([
                'name' => $productData['name'],
                'name_ar' => $productData['name_ar'] ?? null,
                'sku' => 'PRD-' . str_pad($created + 1, 5, '0', STR_PAD_LEFT),
                'category_id' => $category->id,
                'purchase_price' => $productData['purchase_price'],
                'selling_price' => $productData['selling_price'],
                'quantity' => mt_rand(5, 100),
                'unit' => $productData['unit'] ?? 'pièce',
                'min_stock' => $productData['min_stock'] ?? 10,
                'is_active' => true,
            ]);

            // Attach random suppliers
            $productSuppliers = $suppliers->random(mt_rand(1, 3));
            foreach ($productSuppliers as $index => $supplier) {
                $product->suppliers()->attach($supplier->id, [
                    'cost_price' => $productData['purchase_price'] * (0.9 + mt_rand(0, 20) / 100),
                    'is_primary' => $index === 0,
                ]);
            }

            $created++;
        }

        // If we need more products, generate variations
        while ($created < $targetCount) {
            $baseProduct = $baseProducts[array_rand($baseProducts)];
            $category = $categories->get($baseProduct['category']);
            if (!$category) continue;

            $variation = $this->generateVariation($baseProduct, $created);
            
            $product = Product::create([
                'name' => $variation['name'],
                'name_ar' => $variation['name_ar'] ?? null,
                'sku' => 'PRD-' . str_pad($created + 1, 5, '0', STR_PAD_LEFT),
                'category_id' => $category->id,
                'purchase_price' => $variation['purchase_price'],
                'selling_price' => $variation['selling_price'],
                'quantity' => mt_rand(0, 150),
                'unit' => $baseProduct['unit'] ?? 'pièce',
                'min_stock' => $baseProduct['min_stock'] ?? 10,
                'is_active' => mt_rand(1, 100) > 5, // 5% inactive
            ]);

            // Attach suppliers
            $productSuppliers = $suppliers->random(mt_rand(1, 2));
            foreach ($productSuppliers as $index => $supplier) {
                $product->suppliers()->attach($supplier->id, [
                    'cost_price' => $variation['purchase_price'] * (0.9 + mt_rand(0, 20) / 100),
                    'is_primary' => $index === 0,
                ]);
            }

            $created++;
        }
    }

    private function generateVariation(array $base, int $index): array
    {
        $suffixes = ['Pro', 'Standard', 'Premium', 'Eco', 'XL', 'Mini', 'Max', 'Plus'];
        $suffix = $suffixes[array_rand($suffixes)];
        
        $priceMultiplier = 0.7 + (mt_rand(0, 60) / 100);
        
        return [
            'name' => $base['name'] . ' ' . $suffix,
            'name_ar' => isset($base['name_ar']) ? $base['name_ar'] . ' ' . $suffix : null,
            'purchase_price' => round($base['purchase_price'] * $priceMultiplier, 2),
            'selling_price' => round($base['selling_price'] * $priceMultiplier, 2),
        ];
    }

    private function getBaseProducts(): array
    {
        return [
            // Outillage à main
            ['name' => 'Marteau de menuisier 300g', 'name_ar' => 'مطرقة نجارة 300غ', 'category' => 'Outillage à main', 'purchase_price' => 450, 'selling_price' => 650, 'unit' => 'pièce', 'min_stock' => 5],
            ['name' => 'Marteau de menuisier 500g', 'name_ar' => 'مطرقة نجارة 500غ', 'category' => 'Outillage à main', 'purchase_price' => 550, 'selling_price' => 800, 'unit' => 'pièce', 'min_stock' => 5],
            ['name' => 'Tournevis plat 150mm', 'name_ar' => 'مفك مسطح 150مم', 'category' => 'Outillage à main', 'purchase_price' => 120, 'selling_price' => 200, 'unit' => 'pièce', 'min_stock' => 10],
            ['name' => 'Tournevis cruciforme PH2', 'name_ar' => 'مفك صليبي PH2', 'category' => 'Outillage à main', 'purchase_price' => 140, 'selling_price' => 230, 'unit' => 'pièce', 'min_stock' => 10],
            ['name' => 'Pince universelle 180mm', 'name_ar' => 'زردية عامة 180مم', 'category' => 'Outillage à main', 'purchase_price' => 350, 'selling_price' => 550, 'unit' => 'pièce', 'min_stock' => 8],
            ['name' => 'Clé à molette 200mm', 'name_ar' => 'مفتاح انجليزي 200مم', 'category' => 'Outillage à main', 'purchase_price' => 500, 'selling_price' => 750, 'unit' => 'pièce', 'min_stock' => 5],
            ['name' => 'Scie à métaux', 'name_ar' => 'منشار حديد', 'category' => 'Outillage à main', 'purchase_price' => 300, 'selling_price' => 480, 'unit' => 'pièce', 'min_stock' => 6],
            ['name' => 'Mètre ruban 5m', 'name_ar' => 'شريط قياس 5م', 'category' => 'Outillage à main', 'purchase_price' => 200, 'selling_price' => 350, 'unit' => 'pièce', 'min_stock' => 10],
            ['name' => 'Niveau à bulle 60cm', 'name_ar' => 'ميزان ماء 60سم', 'category' => 'Outillage à main', 'purchase_price' => 400, 'selling_price' => 650, 'unit' => 'pièce', 'min_stock' => 5],
            
            // Outillage électrique
            ['name' => 'Perceuse 500W', 'name_ar' => 'مثقاب 500واط', 'category' => 'Outillage électrique', 'purchase_price' => 3500, 'selling_price' => 5000, 'unit' => 'pièce', 'min_stock' => 3],
            ['name' => 'Perceuse à percussion 850W', 'name_ar' => 'مثقاب دقاق 850واط', 'category' => 'Outillage électrique', 'purchase_price' => 7000, 'selling_price' => 10000, 'unit' => 'pièce', 'min_stock' => 2],
            ['name' => 'Meuleuse d\'angle 115mm', 'name_ar' => 'صاروخ 115مم', 'category' => 'Outillage électrique', 'purchase_price' => 4000, 'selling_price' => 6000, 'unit' => 'pièce', 'min_stock' => 3],
            ['name' => 'Visseuse sans fil 18V', 'name_ar' => 'مفك كهربائي 18فولت', 'category' => 'Outillage électrique', 'purchase_price' => 9000, 'selling_price' => 13500, 'unit' => 'pièce', 'min_stock' => 2],
            ['name' => 'Disque à tronçonner 115mm', 'name_ar' => 'قرص قطع 115مم', 'category' => 'Outillage électrique', 'purchase_price' => 80, 'selling_price' => 150, 'unit' => 'pièce', 'min_stock' => 50],
            
            // Plomberie
            ['name' => 'Robinet de cuisine', 'name_ar' => 'حنفية مطبخ', 'category' => 'Plomberie', 'purchase_price' => 1500, 'selling_price' => 2500, 'unit' => 'pièce', 'min_stock' => 5],
            ['name' => 'Mitigeur de douche', 'name_ar' => 'خلاط دوش', 'category' => 'Plomberie', 'purchase_price' => 2000, 'selling_price' => 3500, 'unit' => 'pièce', 'min_stock' => 3],
            ['name' => 'Tuyau PVC 50mm (3m)', 'name_ar' => 'أنبوب PVC 50مم (3م)', 'category' => 'Plomberie', 'purchase_price' => 250, 'selling_price' => 450, 'unit' => 'pièce', 'min_stock' => 20],
            ['name' => 'Coude PVC 50mm', 'name_ar' => 'كوع PVC 50مم', 'category' => 'Plomberie', 'purchase_price' => 50, 'selling_price' => 100, 'unit' => 'pièce', 'min_stock' => 30],
            ['name' => 'Téflon', 'name_ar' => 'تيفلون', 'category' => 'Plomberie', 'purchase_price' => 30, 'selling_price' => 60, 'unit' => 'pièce', 'min_stock' => 50],
            
            // Électricité
            ['name' => 'Câble électrique 2.5mm² (100m)', 'name_ar' => 'كابل كهربائي 2.5مم² (100م)', 'category' => 'Électricité', 'purchase_price' => 5000, 'selling_price' => 7500, 'unit' => 'rouleau', 'min_stock' => 5],
            ['name' => 'Interrupteur simple', 'name_ar' => 'مفتاح بسيط', 'category' => 'Électricité', 'purchase_price' => 150, 'selling_price' => 280, 'unit' => 'pièce', 'min_stock' => 20],
            ['name' => 'Prise électrique 16A', 'name_ar' => 'بريز كهربائي 16أ', 'category' => 'Électricité', 'purchase_price' => 120, 'selling_price' => 220, 'unit' => 'pièce', 'min_stock' => 25],
            ['name' => 'Disjoncteur 16A', 'name_ar' => 'قاطع تيار 16أ', 'category' => 'Électricité', 'purchase_price' => 380, 'selling_price' => 650, 'unit' => 'pièce', 'min_stock' => 10],
            ['name' => 'Ampoule LED E27 9W', 'name_ar' => 'مصباح LED E27 9واط', 'category' => 'Électricité', 'purchase_price' => 100, 'selling_price' => 200, 'unit' => 'pièce', 'min_stock' => 50],
            
            // Peinture
            ['name' => 'Peinture acrylique blanche 10L', 'name_ar' => 'دهان أكريليك أبيض 10ل', 'category' => 'Peinture', 'purchase_price' => 3500, 'selling_price' => 5500, 'unit' => 'seau', 'min_stock' => 5],
            ['name' => 'Rouleau peinture 180mm', 'name_ar' => 'رولو دهان 180مم', 'category' => 'Peinture', 'purchase_price' => 150, 'selling_price' => 280, 'unit' => 'pièce', 'min_stock' => 15],
            ['name' => 'Pinceau plat 50mm', 'name_ar' => 'فرشاة مسطحة 50مم', 'category' => 'Peinture', 'purchase_price' => 80, 'selling_price' => 150, 'unit' => 'pièce', 'min_stock' => 20],
            ['name' => 'White spirit 1L', 'name_ar' => 'مذيب وايت سبيريت 1ل', 'category' => 'Peinture', 'purchase_price' => 300, 'selling_price' => 500, 'unit' => 'bouteille', 'min_stock' => 15],
            
            // Quincaillerie générale
            ['name' => 'Vis à bois 4x40mm (100)', 'name_ar' => 'براغي خشب 4×40مم (100)', 'category' => 'Quincaillerie générale', 'purchase_price' => 150, 'selling_price' => 280, 'unit' => 'boîte', 'min_stock' => 20],
            ['name' => 'Clous 60mm (1kg)', 'name_ar' => 'مسامير 60مم (1كغ)', 'category' => 'Quincaillerie générale', 'purchase_price' => 200, 'selling_price' => 380, 'unit' => 'kg', 'min_stock' => 10],
            ['name' => 'Charnière 75mm', 'name_ar' => 'مفصلة 75مم', 'category' => 'Quincaillerie générale', 'purchase_price' => 80, 'selling_price' => 150, 'unit' => 'paire', 'min_stock' => 20],
            ['name' => 'Cadenas 40mm', 'name_ar' => 'قفل 40مم', 'category' => 'Quincaillerie générale', 'purchase_price' => 300, 'selling_price' => 550, 'unit' => 'pièce', 'min_stock' => 10],
            
            // Jardinage
            ['name' => 'Pelle ronde', 'name_ar' => 'مجرفة دائرية', 'category' => 'Jardinage', 'purchase_price' => 600, 'selling_price' => 1000, 'unit' => 'pièce', 'min_stock' => 5],
            ['name' => 'Râteau', 'name_ar' => 'مشط حديقة', 'category' => 'Jardinage', 'purchase_price' => 400, 'selling_price' => 700, 'unit' => 'pièce', 'min_stock' => 5],
            ['name' => 'Tuyau d\'arrosage 25m', 'name_ar' => 'خرطوم سقي 25م', 'category' => 'Jardinage', 'purchase_price' => 1500, 'selling_price' => 2500, 'unit' => 'pièce', 'min_stock' => 5],
            
            // Sécurité
            ['name' => 'Gants de travail', 'name_ar' => 'قفازات عمل', 'category' => 'Sécurité', 'purchase_price' => 150, 'selling_price' => 280, 'unit' => 'paire', 'min_stock' => 20],
            ['name' => 'Lunettes de protection', 'name_ar' => 'نظارات واقية', 'category' => 'Sécurité', 'purchase_price' => 200, 'selling_price' => 380, 'unit' => 'pièce', 'min_stock' => 15],
            ['name' => 'Casque de chantier', 'name_ar' => 'خوذة ورشة', 'category' => 'Sécurité', 'purchase_price' => 350, 'selling_price' => 600, 'unit' => 'pièce', 'min_stock' => 10],
            
            // Construction
            ['name' => 'Ciment 50kg', 'name_ar' => 'اسمنت 50كغ', 'category' => 'Construction', 'purchase_price' => 800, 'selling_price' => 1200, 'unit' => 'sac', 'min_stock' => 20],
            ['name' => 'Truelle', 'name_ar' => 'مسطرين', 'category' => 'Construction', 'purchase_price' => 200, 'selling_price' => 380, 'unit' => 'pièce', 'min_stock' => 10],
            ['name' => 'Fil à plomb', 'name_ar' => 'خيط شاقول', 'category' => 'Construction', 'purchase_price' => 150, 'selling_price' => 280, 'unit' => 'pièce', 'min_stock' => 8],
        ];
    }
}
