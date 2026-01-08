<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::all()->keyBy('name');
        $suppliers = Supplier::all();

        $products = [
            // Outillage à main
            ['name' => 'Marteau de menuisier 300g', 'name_ar' => 'مطرقة نجارة 300غ', 'category' => 'Outillage à main', 'purchase_price' => 450, 'selling_price' => 650, 'unit' => 'pièce', 'min_stock' => 5],
            ['name' => 'Marteau de menuisier 500g', 'name_ar' => 'مطرقة نجارة 500غ', 'category' => 'Outillage à main', 'purchase_price' => 550, 'selling_price' => 800, 'unit' => 'pièce', 'min_stock' => 5],
            ['name' => 'Tournevis plat 150mm', 'name_ar' => 'مفك مسطح 150مم', 'category' => 'Outillage à main', 'purchase_price' => 120, 'selling_price' => 200, 'unit' => 'pièce', 'min_stock' => 10],
            ['name' => 'Tournevis plat 200mm', 'name_ar' => 'مفك مسطح 200مم', 'category' => 'Outillage à main', 'purchase_price' => 150, 'selling_price' => 250, 'unit' => 'pièce', 'min_stock' => 10],
            ['name' => 'Tournevis cruciforme PH1', 'name_ar' => 'مفك صليبي PH1', 'category' => 'Outillage à main', 'purchase_price' => 130, 'selling_price' => 220, 'unit' => 'pièce', 'min_stock' => 10],
            ['name' => 'Tournevis cruciforme PH2', 'name_ar' => 'مفك صليبي PH2', 'category' => 'Outillage à main', 'purchase_price' => 140, 'selling_price' => 230, 'unit' => 'pièce', 'min_stock' => 10],
            ['name' => 'Pince universelle 180mm', 'name_ar' => 'زردية عامة 180مم', 'category' => 'Outillage à main', 'purchase_price' => 350, 'selling_price' => 550, 'unit' => 'pièce', 'min_stock' => 8],
            ['name' => 'Pince coupante 160mm', 'name_ar' => 'زردية قاطعة 160مم', 'category' => 'Outillage à main', 'purchase_price' => 400, 'selling_price' => 600, 'unit' => 'pièce', 'min_stock' => 8],
            ['name' => 'Clé à molette 200mm', 'name_ar' => 'مفتاح انجليزي 200مم', 'category' => 'Outillage à main', 'purchase_price' => 500, 'selling_price' => 750, 'unit' => 'pièce', 'min_stock' => 5],
            ['name' => 'Clé à molette 250mm', 'name_ar' => 'مفتاح انجليزي 250مم', 'category' => 'Outillage à main', 'purchase_price' => 650, 'selling_price' => 950, 'unit' => 'pièce', 'min_stock' => 5],
            ['name' => 'Scie à métaux', 'name_ar' => 'منشار حديد', 'category' => 'Outillage à main', 'purchase_price' => 300, 'selling_price' => 480, 'unit' => 'pièce', 'min_stock' => 6],
            ['name' => 'Lame de scie à métaux', 'name_ar' => 'شفرة منشار حديد', 'category' => 'Outillage à main', 'purchase_price' => 50, 'selling_price' => 100, 'unit' => 'pièce', 'min_stock' => 50],
            ['name' => 'Mètre ruban 5m', 'name_ar' => 'شريط قياس 5م', 'category' => 'Outillage à main', 'purchase_price' => 200, 'selling_price' => 350, 'unit' => 'pièce', 'min_stock' => 10],
            ['name' => 'Mètre ruban 8m', 'name_ar' => 'شريط قياس 8م', 'category' => 'Outillage à main', 'purchase_price' => 300, 'selling_price' => 500, 'unit' => 'pièce', 'min_stock' => 8],
            ['name' => 'Niveau à bulle 60cm', 'name_ar' => 'ميزان ماء 60سم', 'category' => 'Outillage à main', 'purchase_price' => 400, 'selling_price' => 650, 'unit' => 'pièce', 'min_stock' => 5],
            
            // Outillage électrique
            ['name' => 'Perceuse 500W', 'name_ar' => 'مثقاب 500واط', 'category' => 'Outillage électrique', 'purchase_price' => 3500, 'selling_price' => 5000, 'unit' => 'pièce', 'min_stock' => 3],
            ['name' => 'Perceuse 750W', 'name_ar' => 'مثقاب 750واط', 'category' => 'Outillage électrique', 'purchase_price' => 5000, 'selling_price' => 7500, 'unit' => 'pièce', 'min_stock' => 3],
            ['name' => 'Perceuse à percussion 850W', 'name_ar' => 'مثقاب دقاق 850واط', 'category' => 'Outillage électrique', 'purchase_price' => 7000, 'selling_price' => 10000, 'unit' => 'pièce', 'min_stock' => 2],
            ['name' => 'Meuleuse d\'angle 115mm', 'name_ar' => 'صاروخ 115مم', 'category' => 'Outillage électrique', 'purchase_price' => 4000, 'selling_price' => 6000, 'unit' => 'pièce', 'min_stock' => 3],
            ['name' => 'Meuleuse d\'angle 125mm', 'name_ar' => 'صاروخ 125مم', 'category' => 'Outillage électrique', 'purchase_price' => 4500, 'selling_price' => 6800, 'unit' => 'pièce', 'min_stock' => 3],
            ['name' => 'Scie sauteuse 500W', 'name_ar' => 'منشار كهربائي 500واط', 'category' => 'Outillage électrique', 'purchase_price' => 5500, 'selling_price' => 8000, 'unit' => 'pièce', 'min_stock' => 2],
            ['name' => 'Visseuse sans fil 12V', 'name_ar' => 'مفك كهربائي 12فولت', 'category' => 'Outillage électrique', 'purchase_price' => 6000, 'selling_price' => 9000, 'unit' => 'pièce', 'min_stock' => 3],
            ['name' => 'Visseuse sans fil 18V', 'name_ar' => 'مفك كهربائي 18فولت', 'category' => 'Outillage électrique', 'purchase_price' => 9000, 'selling_price' => 13500, 'unit' => 'pièce', 'min_stock' => 2],
            ['name' => 'Disque à tronçonner 115mm', 'name_ar' => 'قرص قطع 115مم', 'category' => 'Outillage électrique', 'purchase_price' => 80, 'selling_price' => 150, 'unit' => 'pièce', 'min_stock' => 50],
            ['name' => 'Disque à tronçonner 125mm', 'name_ar' => 'قرص قطع 125مم', 'category' => 'Outillage électrique', 'purchase_price' => 100, 'selling_price' => 180, 'unit' => 'pièce', 'min_stock' => 50],
            
            // Plomberie
            ['name' => 'Robinet de cuisine', 'name_ar' => 'حنفية مطبخ', 'category' => 'Plomberie', 'purchase_price' => 1500, 'selling_price' => 2500, 'unit' => 'pièce', 'min_stock' => 5],
            ['name' => 'Robinet de lavabo', 'name_ar' => 'حنفية حوض', 'category' => 'Plomberie', 'purchase_price' => 1200, 'selling_price' => 2000, 'unit' => 'pièce', 'min_stock' => 5],
            ['name' => 'Mitigeur de douche', 'name_ar' => 'خلاط دوش', 'category' => 'Plomberie', 'purchase_price' => 2000, 'selling_price' => 3500, 'unit' => 'pièce', 'min_stock' => 3],
            ['name' => 'Flexible de douche 1.5m', 'name_ar' => 'خرطوم دوش 1.5م', 'category' => 'Plomberie', 'purchase_price' => 300, 'selling_price' => 550, 'unit' => 'pièce', 'min_stock' => 10],
            ['name' => 'Pommeau de douche', 'name_ar' => 'رأس دوش', 'category' => 'Plomberie', 'purchase_price' => 400, 'selling_price' => 700, 'unit' => 'pièce', 'min_stock' => 8],
            ['name' => 'Tuyau PVC 50mm (3m)', 'name_ar' => 'أنبوب PVC 50مم (3م)', 'category' => 'Plomberie', 'purchase_price' => 250, 'selling_price' => 450, 'unit' => 'pièce', 'min_stock' => 20],
            ['name' => 'Tuyau PVC 100mm (3m)', 'name_ar' => 'أنبوب PVC 100مم (3م)', 'category' => 'Plomberie', 'purchase_price' => 400, 'selling_price' => 700, 'unit' => 'pièce', 'min_stock' => 15],
            ['name' => 'Coude PVC 50mm', 'name_ar' => 'كوع PVC 50مم', 'category' => 'Plomberie', 'purchase_price' => 50, 'selling_price' => 100, 'unit' => 'pièce', 'min_stock' => 30],
            ['name' => 'Coude PVC 100mm', 'name_ar' => 'كوع PVC 100مم', 'category' => 'Plomberie', 'purchase_price' => 80, 'selling_price' => 150, 'unit' => 'pièce', 'min_stock' => 20],
            ['name' => 'Té PVC 50mm', 'name_ar' => 'تي PVC 50مم', 'category' => 'Plomberie', 'purchase_price' => 70, 'selling_price' => 130, 'unit' => 'pièce', 'min_stock' => 25],
            ['name' => 'Siphon de lavabo', 'name_ar' => 'سيفون حوض', 'category' => 'Plomberie', 'purchase_price' => 200, 'selling_price' => 380, 'unit' => 'pièce', 'min_stock' => 10],
            ['name' => 'Joint de robinet (lot)', 'name_ar' => 'جوان حنفية (مجموعة)', 'category' => 'Plomberie', 'purchase_price' => 50, 'selling_price' => 100, 'unit' => 'lot', 'min_stock' => 20],
            ['name' => 'Téflon', 'name_ar' => 'تيفلون', 'category' => 'Plomberie', 'purchase_price' => 30, 'selling_price' => 60, 'unit' => 'pièce', 'min_stock' => 50],
            
            // Électricité
            ['name' => 'Câble électrique 1.5mm² (100m)', 'name_ar' => 'كابل كهربائي 1.5مم² (100م)', 'category' => 'Électricité', 'purchase_price' => 3000, 'selling_price' => 4500, 'unit' => 'rouleau', 'min_stock' => 5],
            ['name' => 'Câble électrique 2.5mm² (100m)', 'name_ar' => 'كابل كهربائي 2.5مم² (100م)', 'category' => 'Électricité', 'purchase_price' => 5000, 'selling_price' => 7500, 'unit' => 'rouleau', 'min_stock' => 5],
            ['name' => 'Interrupteur simple', 'name_ar' => 'مفتاح بسيط', 'category' => 'Électricité', 'purchase_price' => 150, 'selling_price' => 280, 'unit' => 'pièce', 'min_stock' => 20],
            ['name' => 'Interrupteur double', 'name_ar' => 'مفتاح مزدوج', 'category' => 'Électricité', 'purchase_price' => 200, 'selling_price' => 380, 'unit' => 'pièce', 'min_stock' => 15],
            ['name' => 'Prise électrique 16A', 'name_ar' => 'بريز كهربائي 16أ', 'category' => 'Électricité', 'purchase_price' => 120, 'selling_price' => 220, 'unit' => 'pièce', 'min_stock' => 25],
            ['name' => 'Prise TV/SAT', 'name_ar' => 'بريز تلفزيون', 'category' => 'Électricité', 'purchase_price' => 180, 'selling_price' => 320, 'unit' => 'pièce', 'min_stock' => 15],
            ['name' => 'Boîte de dérivation', 'name_ar' => 'علبة توزيع', 'category' => 'Électricité', 'purchase_price' => 80, 'selling_price' => 150, 'unit' => 'pièce', 'min_stock' => 30],
            ['name' => 'Disjoncteur 10A', 'name_ar' => 'قاطع تيار 10أ', 'category' => 'Électricité', 'purchase_price' => 350, 'selling_price' => 600, 'unit' => 'pièce', 'min_stock' => 10],
            ['name' => 'Disjoncteur 16A', 'name_ar' => 'قاطع تيار 16أ', 'category' => 'Électricité', 'purchase_price' => 380, 'selling_price' => 650, 'unit' => 'pièce', 'min_stock' => 10],
            ['name' => 'Disjoncteur 20A', 'name_ar' => 'قاطع تيار 20أ', 'category' => 'Électricité', 'purchase_price' => 420, 'selling_price' => 720, 'unit' => 'pièce', 'min_stock' => 8],
            ['name' => 'Différentiel 30mA', 'name_ar' => 'قاطع تفاضلي 30م أ', 'category' => 'Électricité', 'purchase_price' => 2000, 'selling_price' => 3200, 'unit' => 'pièce', 'min_stock' => 5],
            ['name' => 'Ampoule LED E27 9W', 'name_ar' => 'مصباح LED E27 9واط', 'category' => 'Électricité', 'purchase_price' => 100, 'selling_price' => 200, 'unit' => 'pièce', 'min_stock' => 50],
            ['name' => 'Ampoule LED E27 12W', 'name_ar' => 'مصباح LED E27 12واط', 'category' => 'Électricité', 'purchase_price' => 130, 'selling_price' => 250, 'unit' => 'pièce', 'min_stock' => 50],
            ['name' => 'Tube LED 120cm', 'name_ar' => 'أنبوب LED 120سم', 'category' => 'Électricité', 'purchase_price' => 350, 'selling_price' => 600, 'unit' => 'pièce', 'min_stock' => 20],
            ['name' => 'Multiprise 4 prises', 'name_ar' => 'مشترك 4 منافذ', 'category' => 'Électricité', 'purchase_price' => 300, 'selling_price' => 550, 'unit' => 'pièce', 'min_stock' => 15],
            
            // Peinture
            ['name' => 'Peinture acrylique blanche 10L', 'name_ar' => 'دهان أكريليك أبيض 10ل', 'category' => 'Peinture', 'purchase_price' => 3500, 'selling_price' => 5500, 'unit' => 'seau', 'min_stock' => 5],
            ['name' => 'Peinture acrylique blanche 4L', 'name_ar' => 'دهان أكريليك أبيض 4ل', 'category' => 'Peinture', 'purchase_price' => 1500, 'selling_price' => 2400, 'unit' => 'seau', 'min_stock' => 8],
            ['name' => 'Peinture glycéro blanche 2.5L', 'name_ar' => 'دهان زيتي أبيض 2.5ل', 'category' => 'Peinture', 'purchase_price' => 2000, 'selling_price' => 3200, 'unit' => 'pot', 'min_stock' => 5],
            ['name' => 'Sous-couche universelle 10L', 'name_ar' => 'طبقة أساس عامة 10ل', 'category' => 'Peinture', 'purchase_price' => 2800, 'selling_price' => 4500, 'unit' => 'seau', 'min_stock' => 4],
            ['name' => 'Rouleau peinture 180mm', 'name_ar' => 'رولو دهان 180مم', 'category' => 'Peinture', 'purchase_price' => 150, 'selling_price' => 280, 'unit' => 'pièce', 'min_stock' => 15],
            ['name' => 'Rouleau peinture 250mm', 'name_ar' => 'رولو دهان 250مم', 'category' => 'Peinture', 'purchase_price' => 200, 'selling_price' => 380, 'unit' => 'pièce', 'min_stock' => 10],
            ['name' => 'Pinceau plat 50mm', 'name_ar' => 'فرشاة مسطحة 50مم', 'category' => 'Peinture', 'purchase_price' => 80, 'selling_price' => 150, 'unit' => 'pièce', 'min_stock' => 20],
            ['name' => 'Pinceau plat 80mm', 'name_ar' => 'فرشاة مسطحة 80مم', 'category' => 'Peinture', 'purchase_price' => 120, 'selling_price' => 220, 'unit' => 'pièce', 'min_stock' => 15],
            ['name' => 'Bac à peinture', 'name_ar' => 'حوض دهان', 'category' => 'Peinture', 'purchase_price' => 100, 'selling_price' => 200, 'unit' => 'pièce', 'min_stock' => 15],
            ['name' => 'Ruban de masquage 50m', 'name_ar' => 'شريط لاصق 50م', 'category' => 'Peinture', 'purchase_price' => 80, 'selling_price' => 150, 'unit' => 'rouleau', 'min_stock' => 30],
            ['name' => 'Bâche de protection 4x5m', 'name_ar' => 'غطاء حماية 4×5م', 'category' => 'Peinture', 'purchase_price' => 150, 'selling_price' => 300, 'unit' => 'pièce', 'min_stock' => 10],
            ['name' => 'White spirit 1L', 'name_ar' => 'مذيب وايت سبيريت 1ل', 'category' => 'Peinture', 'purchase_price' => 300, 'selling_price' => 500, 'unit' => 'bouteille', 'min_stock' => 15],
            
            // Quincaillerie générale
            ['name' => 'Vis à bois 4x40mm (100)', 'name_ar' => 'براغي خشب 4×40مم (100)', 'category' => 'Quincaillerie générale', 'purchase_price' => 150, 'selling_price' => 280, 'unit' => 'boîte', 'min_stock' => 20],
            ['name' => 'Vis à bois 5x50mm (100)', 'name_ar' => 'براغي خشب 5×50مم (100)', 'category' => 'Quincaillerie générale', 'purchase_price' => 200, 'selling_price' => 380, 'unit' => 'boîte', 'min_stock' => 20],
            ['name' => 'Vis à métaux 5x20mm (100)', 'name_ar' => 'براغي حديد 5×20مم (100)', 'category' => 'Quincaillerie générale', 'purchase_price' => 180, 'selling_price' => 350, 'unit' => 'boîte', 'min_stock' => 15],
            ['name' => 'Clous 60mm (1kg)', 'name_ar' => 'مسامير 60مم (1كغ)', 'category' => 'Quincaillerie générale', 'purchase_price' => 200, 'selling_price' => 380, 'unit' => 'kg', 'min_stock' => 10],
            ['name' => 'Clous 80mm (1kg)', 'name_ar' => 'مسامير 80مم (1كغ)', 'category' => 'Quincaillerie générale', 'purchase_price' => 220, 'selling_price' => 400, 'unit' => 'kg', 'min_stock' => 10],
            ['name' => 'Écrous M6 (100)', 'name_ar' => 'صواميل M6 (100)', 'category' => 'Quincaillerie générale', 'purchase_price' => 100, 'selling_price' => 200, 'unit' => 'boîte', 'min_stock' => 15],
            ['name' => 'Écrous M8 (100)', 'name_ar' => 'صواميل M8 (100)', 'category' => 'Quincaillerie générale', 'purchase_price' => 120, 'selling_price' => 240, 'unit' => 'boîte', 'min_stock' => 15],
            ['name' => 'Boulons M6x50mm (50)', 'name_ar' => 'بولونات M6×50مم (50)', 'category' => 'Quincaillerie générale', 'purchase_price' => 150, 'selling_price' => 300, 'unit' => 'boîte', 'min_stock' => 10],
            ['name' => 'Rondelles M8 (100)', 'name_ar' => 'رندلات M8 (100)', 'category' => 'Quincaillerie générale', 'purchase_price' => 80, 'selling_price' => 160, 'unit' => 'boîte', 'min_stock' => 15],
            ['name' => 'Chaîne galvanisée 5mm (m)', 'name_ar' => 'سلسلة مجلفنة 5مم (م)', 'category' => 'Quincaillerie générale', 'purchase_price' => 150, 'selling_price' => 280, 'unit' => 'mètre', 'min_stock' => 20],
            
            // Fixation
            ['name' => 'Cheville nylon 6mm (100)', 'name_ar' => 'صراصير نايلون 6مم (100)', 'category' => 'Fixation', 'purchase_price' => 80, 'selling_price' => 150, 'unit' => 'boîte', 'min_stock' => 30],
            ['name' => 'Cheville nylon 8mm (100)', 'name_ar' => 'صراصير نايلون 8مم (100)', 'category' => 'Fixation', 'purchase_price' => 100, 'selling_price' => 200, 'unit' => 'boîte', 'min_stock' => 30],
            ['name' => 'Cheville nylon 10mm (50)', 'name_ar' => 'صراصير نايلون 10مم (50)', 'category' => 'Fixation', 'purchase_price' => 80, 'selling_price' => 160, 'unit' => 'boîte', 'min_stock' => 25],
            ['name' => 'Cheville à frapper 6x40mm (100)', 'name_ar' => 'صراصير دق 6×40مم (100)', 'category' => 'Fixation', 'purchase_price' => 200, 'selling_price' => 380, 'unit' => 'boîte', 'min_stock' => 20],
            ['name' => 'Cheville chimique 300ml', 'name_ar' => 'صراصير كيميائية 300مل', 'category' => 'Fixation', 'purchase_price' => 800, 'selling_price' => 1400, 'unit' => 'cartouche', 'min_stock' => 8],
            ['name' => 'Tige filetée M8 (1m)', 'name_ar' => 'قضيب ملولب M8 (1م)', 'category' => 'Fixation', 'purchase_price' => 100, 'selling_price' => 200, 'unit' => 'pièce', 'min_stock' => 20],
            ['name' => 'Équerre 50x50mm', 'name_ar' => 'زاوية 50×50مم', 'category' => 'Fixation', 'purchase_price' => 30, 'selling_price' => 60, 'unit' => 'pièce', 'min_stock' => 50],
            ['name' => 'Équerre 80x80mm', 'name_ar' => 'زاوية 80×80مم', 'category' => 'Fixation', 'purchase_price' => 50, 'selling_price' => 100, 'unit' => 'pièce', 'min_stock' => 40],
            ['name' => 'Platine perforée 100x200mm', 'name_ar' => 'صفيحة مثقبة 100×200مم', 'category' => 'Fixation', 'purchase_price' => 80, 'selling_price' => 150, 'unit' => 'pièce', 'min_stock' => 25],
            
            // Serrurerie
            ['name' => 'Serrure encastrable', 'name_ar' => 'قفل مدمج', 'category' => 'Serrurerie', 'purchase_price' => 800, 'selling_price' => 1400, 'unit' => 'pièce', 'min_stock' => 5],
            ['name' => 'Serrure en applique', 'name_ar' => 'قفل سطحي', 'category' => 'Serrurerie', 'purchase_price' => 600, 'selling_price' => 1000, 'unit' => 'pièce', 'min_stock' => 5],
            ['name' => 'Cadenas 40mm', 'name_ar' => 'قفل 40مم', 'category' => 'Serrurerie', 'purchase_price' => 200, 'selling_price' => 380, 'unit' => 'pièce', 'min_stock' => 10],
            ['name' => 'Cadenas 60mm', 'name_ar' => 'قفل 60مم', 'category' => 'Serrurerie', 'purchase_price' => 350, 'selling_price' => 600, 'unit' => 'pièce', 'min_stock' => 8],
            ['name' => 'Poignée de porte', 'name_ar' => 'مقبض باب', 'category' => 'Serrurerie', 'purchase_price' => 500, 'selling_price' => 850, 'unit' => 'pièce', 'min_stock' => 8],
            ['name' => 'Cylindre de serrure', 'name_ar' => 'أسطوانة قفل', 'category' => 'Serrurerie', 'purchase_price' => 400, 'selling_price' => 700, 'unit' => 'pièce', 'min_stock' => 10],
            ['name' => 'Charnière 100mm', 'name_ar' => 'مفصل 100مم', 'category' => 'Serrurerie', 'purchase_price' => 80, 'selling_price' => 150, 'unit' => 'pièce', 'min_stock' => 30],
            ['name' => 'Verrou à bouton', 'name_ar' => 'ترباس بزر', 'category' => 'Serrurerie', 'purchase_price' => 150, 'selling_price' => 280, 'unit' => 'pièce', 'min_stock' => 15],
            
            // Jardinage
            ['name' => 'Pelle ronde', 'name_ar' => 'مجرفة دائرية', 'category' => 'Jardinage', 'purchase_price' => 500, 'selling_price' => 850, 'unit' => 'pièce', 'min_stock' => 5],
            ['name' => 'Pelle carrée', 'name_ar' => 'مجرفة مربعة', 'category' => 'Jardinage', 'purchase_price' => 480, 'selling_price' => 800, 'unit' => 'pièce', 'min_stock' => 5],
            ['name' => 'Pioche', 'name_ar' => 'فأس', 'category' => 'Jardinage', 'purchase_price' => 600, 'selling_price' => 1000, 'unit' => 'pièce', 'min_stock' => 4],
            ['name' => 'Râteau', 'name_ar' => 'مشط', 'category' => 'Jardinage', 'purchase_price' => 350, 'selling_price' => 600, 'unit' => 'pièce', 'min_stock' => 5],
            ['name' => 'Binette', 'name_ar' => 'معزقة', 'category' => 'Jardinage', 'purchase_price' => 300, 'selling_price' => 520, 'unit' => 'pièce', 'min_stock' => 5],
            ['name' => 'Sécateur', 'name_ar' => 'مقص تقليم', 'category' => 'Jardinage', 'purchase_price' => 400, 'selling_price' => 700, 'unit' => 'pièce', 'min_stock' => 8],
            ['name' => 'Tuyau d\'arrosage 20m', 'name_ar' => 'خرطوم سقي 20م', 'category' => 'Jardinage', 'purchase_price' => 800, 'selling_price' => 1400, 'unit' => 'pièce', 'min_stock' => 5],
            ['name' => 'Pistolet d\'arrosage', 'name_ar' => 'مسدس سقي', 'category' => 'Jardinage', 'purchase_price' => 200, 'selling_price' => 380, 'unit' => 'pièce', 'min_stock' => 10],
            
            // Sécurité
            ['name' => 'Gants de travail', 'name_ar' => 'قفازات عمل', 'category' => 'Sécurité', 'purchase_price' => 150, 'selling_price' => 280, 'unit' => 'paire', 'min_stock' => 20],
            ['name' => 'Lunettes de protection', 'name_ar' => 'نظارات حماية', 'category' => 'Sécurité', 'purchase_price' => 100, 'selling_price' => 200, 'unit' => 'pièce', 'min_stock' => 15],
            ['name' => 'Casque de chantier', 'name_ar' => 'خوذة ورشة', 'category' => 'Sécurité', 'purchase_price' => 300, 'selling_price' => 550, 'unit' => 'pièce', 'min_stock' => 8],
            ['name' => 'Chaussures de sécurité', 'name_ar' => 'أحذية أمان', 'category' => 'Sécurité', 'purchase_price' => 2000, 'selling_price' => 3500, 'unit' => 'paire', 'min_stock' => 5],
            ['name' => 'Masque anti-poussière (50)', 'name_ar' => 'قناع مضاد للغبار (50)', 'category' => 'Sécurité', 'purchase_price' => 250, 'selling_price' => 450, 'unit' => 'boîte', 'min_stock' => 10],
            ['name' => 'Bouchons d\'oreille (200)', 'name_ar' => 'سدادات أذن (200)', 'category' => 'Sécurité', 'purchase_price' => 300, 'selling_price' => 550, 'unit' => 'boîte', 'min_stock' => 8],
            ['name' => 'Gilet haute visibilité', 'name_ar' => 'سترة عاكسة', 'category' => 'Sécurité', 'purchase_price' => 200, 'selling_price' => 380, 'unit' => 'pièce', 'min_stock' => 10],
            ['name' => 'Extincteur 6kg', 'name_ar' => 'طفاية حريق 6كغ', 'category' => 'Sécurité', 'purchase_price' => 2500, 'selling_price' => 4000, 'unit' => 'pièce', 'min_stock' => 3],
        ];

        $skuCounter = 1;

        foreach ($products as $productData) {
            $categoryId = $categories->get($productData['category'])?->id;
            
            $quantity = rand(5, 150);
            
            $product = Product::create([
                'name' => $productData['name'],
                'name_ar' => $productData['name_ar'],
                'sku' => sprintf('QC%05d', $skuCounter++),
                'barcode' => '6280' . str_pad(rand(100000, 999999), 6, '0'),
                'category_id' => $categoryId,
                'purchase_price' => $productData['purchase_price'],
                'selling_price' => $productData['selling_price'],
                'quantity' => $quantity,
                'unit' => $productData['unit'],
                'min_stock' => $productData['min_stock'],
                'location' => 'R' . rand(1, 10) . '-E' . rand(1, 5),
                'is_active' => true,
            ]);

            // Attach random suppliers
            $randomSuppliers = $suppliers->random(rand(1, 2))->pluck('id')->toArray();
            $product->suppliers()->attach($randomSuppliers);
        }
    }
}
