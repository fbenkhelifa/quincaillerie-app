<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Category $category;
    protected Supplier $supplier;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create(['role' => 'admin']);
        $this->category = Category::factory()->create();
        $this->supplier = Supplier::factory()->create();
    }

    public function test_products_index_page_is_displayed(): void
    {
        Product::factory()->count(5)->create(['category_id' => $this->category->id]);

        $response = $this->actingAs($this->user)
            ->get(route('products.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Products/Index')
            ->has('products.data', 5)
        );
    }

    public function test_products_can_be_filtered_by_category(): void
    {
        $category2 = Category::factory()->create();
        Product::factory()->count(3)->create(['category_id' => $this->category->id]);
        Product::factory()->count(2)->create(['category_id' => $category2->id]);

        $response = $this->actingAs($this->user)
            ->get(route('products.index', ['category_id' => $this->category->id]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('products.data', 3)
        );
    }

    public function test_products_can_be_searched(): void
    {
        Product::factory()->create([
            'name' => 'Marteau Professionnel',
            'category_id' => $this->category->id,
        ]);
        Product::factory()->create([
            'name' => 'Tournevis',
            'category_id' => $this->category->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('products.index', ['search' => 'Marteau']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.name', 'Marteau Professionnel')
        );
    }

    public function test_create_product_page_is_displayed(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('products.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Products/Create')
            ->has('categories')
            ->has('suppliers')
        );
    }

    public function test_product_can_be_created(): void
    {
        Storage::fake('public');

        $response = $this->actingAs($this->user)
            ->post(route('products.store'), [
                'name' => 'Marteau Test',
                'sku' => 'MAR-001',
                'barcode' => '1234567890123',
                'category_id' => $this->category->id,
                'cost_price' => 500,
                'selling_price' => 750,
                'quantity' => 100,
                'min_quantity' => 10,
                'unit' => 'pièce',
                'is_active' => true,
                'supplier_ids' => [$this->supplier->id],
            ]);

        $response->assertRedirect(route('products.index'));
        
        $this->assertDatabaseHas('products', [
            'name' => 'Marteau Test',
            'sku' => 'MAR-001',
            'quantity' => 100,
        ]);
    }

    public function test_product_can_be_created_with_image(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('product.jpg', 400, 400);

        $response = $this->actingAs($this->user)
            ->post(route('products.store'), [
                'name' => 'Produit avec Image',
                'sku' => 'IMG-001',
                'category_id' => $this->category->id,
                'cost_price' => 100,
                'selling_price' => 150,
                'quantity' => 50,
                'unit' => 'pièce',
                'is_active' => true,
                'image' => $file,
            ]);

        $response->assertRedirect(route('products.index'));
        
        $product = Product::where('sku', 'IMG-001')->first();
        $this->assertNotNull($product->image_url);
        Storage::disk('public')->assertExists('products/' . $file->hashName());
    }

    public function test_product_can_be_updated(): void
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'name' => 'Old Name',
        ]);

        $response = $this->actingAs($this->user)
            ->put(route('products.update', $product), [
                'name' => 'New Name',
                'sku' => $product->sku,
                'category_id' => $this->category->id,
                'cost_price' => $product->cost_price,
                'selling_price' => $product->selling_price,
                'quantity' => $product->quantity,
                'unit' => $product->unit,
                'is_active' => true,
            ]);

        $response->assertRedirect(route('products.index'));
        
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'New Name',
        ]);
    }

    public function test_product_can_be_deleted(): void
    {
        $product = Product::factory()->create(['category_id' => $this->category->id]);

        $response = $this->actingAs($this->user)
            ->delete(route('products.destroy', $product));

        $response->assertRedirect(route('products.index'));
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_product_stock_can_be_adjusted(): void
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'quantity' => 100,
        ]);

        // Test adding stock
        $response = $this->actingAs($this->user)
            ->post(route('products.adjust-stock', $product), [
                'type' => 'in',
                'quantity' => 50,
                'reason' => 'adjustment',
                'notes' => 'Test adjustment',
            ]);

        $response->assertRedirect();
        $this->assertEquals(150, $product->fresh()->quantity);

        // Test removing stock
        $response = $this->actingAs($this->user)
            ->post(route('products.adjust-stock', $product), [
                'type' => 'out',
                'quantity' => 30,
                'reason' => 'damage',
                'notes' => 'Damaged items',
            ]);

        $response->assertRedirect();
        $this->assertEquals(120, $product->fresh()->quantity);
    }

    public function test_products_can_be_searched_via_api(): void
    {
        Product::factory()->create([
            'name' => 'Clé à molette',
            'sku' => 'CLE-001',
            'barcode' => '9876543210123',
            'category_id' => $this->category->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson(route('products.search', ['q' => 'CLE-001']));

        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonFragment(['sku' => 'CLE-001']);
    }

    public function test_unauthorized_user_cannot_delete_product(): void
    {
        $viewer = User::factory()->create(['role' => 'viewer']);
        $product = Product::factory()->create(['category_id' => $this->category->id]);

        $response = $this->actingAs($viewer)
            ->delete(route('products.destroy', $product));

        $response->assertStatus(403);
        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }
}
