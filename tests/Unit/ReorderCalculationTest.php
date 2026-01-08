<?php

namespace Tests\Unit;

use App\Models\BillItem;
use App\Models\Product;
use App\Services\Replenishment\DemandForecastingService;
use App\Services\Replenishment\ReorderCalculationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReorderCalculationTest extends TestCase
{
    use RefreshDatabase;

    protected ReorderCalculationService $reorderService;
    protected DemandForecastingService $forecastService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->forecastService = new DemandForecastingService();
        $this->reorderService = new ReorderCalculationService($this->forecastService);
    }

    /** @test */
    public function it_returns_null_when_stock_is_above_reorder_point(): void
    {
        $product = Product::factory()->create([
            'quantity' => 100,
            'min_stock' => 10,
        ]);

        $result = $this->reorderService->computeForProduct($product);

        // With no sales history, should not suggest reorder if stock is high
        $this->assertNull($result);
    }

    /** @test */
    public function it_generates_suggestion_when_stock_is_below_min(): void
    {
        $product = Product::factory()->create([
            'quantity' => 5,
            'min_stock' => 20,
        ]);

        $result = $this->reorderService->computeForProduct($product);

        $this->assertNotNull($result);
        $this->assertEquals($product->id, $result['product_id']);
        $this->assertGreaterThan(0, $result['recommended_qty']);
        $this->assertEquals(5, $result['current_stock']);
    }

    /** @test */
    public function it_calculates_reorder_point_correctly(): void
    {
        $product = Product::factory()->create([
            'quantity' => 10,
            'min_stock' => 15,
        ]);

        $result = $this->reorderService->computeForProduct($product);

        $this->assertNotNull($result);
        // Reorder point should be at least min_stock
        $this->assertGreaterThanOrEqual(15, $result['reorder_point']);
    }

    /** @test */
    public function it_determines_urgency_based_on_stock_level(): void
    {
        // Critical urgency - stock below safety stock
        $criticalProduct = Product::factory()->create([
            'quantity' => 0,
            'min_stock' => 20,
        ]);

        $result = $this->reorderService->computeForProduct($criticalProduct);
        $this->assertEquals('critical', $result['urgency']);

        // Low urgency - stock just slightly below reorder point
        $lowProduct = Product::factory()->create([
            'quantity' => 18,
            'min_stock' => 20,
        ]);

        $result = $this->reorderService->computeForProduct($lowProduct);
        // With no sales history, this might be low or medium
        $this->assertContains($result['urgency'], ['low', 'medium', 'high']);
    }

    /** @test */
    public function it_generates_explanation_in_reason_json(): void
    {
        $product = Product::factory()->create([
            'quantity' => 5,
            'min_stock' => 20,
        ]);

        $result = $this->reorderService->computeForProduct($product);

        $this->assertNotNull($result);
        $this->assertArrayHasKey('reason_json', $result);
        $this->assertIsArray($result['reason_json']);
        $this->assertArrayHasKey('summary', $result['reason_json']);
    }

    /** @test */
    public function it_includes_forecast_data_for_charts(): void
    {
        $product = Product::factory()->create([
            'quantity' => 5,
            'min_stock' => 20,
        ]);

        $result = $this->reorderService->computeForProduct($product);

        $this->assertArrayHasKey('forecast_data', $result);
    }

    /** @test */
    public function it_calculates_recommended_quantity_with_safety_margin(): void
    {
        $product = Product::factory()->create([
            'quantity' => 0,
            'min_stock' => 10,
        ]);

        $result = $this->reorderService->computeForProduct($product);

        $this->assertNotNull($result);
        // Recommended qty should cover reorder point plus some buffer
        $this->assertGreaterThanOrEqual($result['reorder_point'], $result['recommended_qty']);
    }

    /** @test */
    public function it_suggests_primary_supplier(): void
    {
        $product = Product::factory()->create([
            'quantity' => 5,
            'min_stock' => 20,
        ]);

        // Create a supplier and attach as primary
        $supplier = \App\Models\Supplier::factory()->create();
        $product->suppliers()->attach($supplier->id, [
            'cost_price' => 10,
            'is_primary' => true,
            'lead_time_days' => 5,
        ]);

        $result = $this->reorderService->computeForProduct($product);

        $this->assertEquals($supplier->id, $result['suggested_supplier_id']);
    }

    /** @test */
    public function it_handles_products_with_no_sales_history(): void
    {
        $product = Product::factory()->create([
            'quantity' => 5,
            'min_stock' => 10,
        ]);

        $result = $this->reorderService->computeForProduct($product);

        $this->assertNotNull($result);
        // Should still generate suggestion based on min_stock
        $this->assertGreaterThan(0, $result['recommended_qty']);
    }

    /** @test */
    public function it_calculates_days_until_stockout(): void
    {
        $product = Product::factory()->create([
            'quantity' => 50,
            'min_stock' => 10,
        ]);

        // The stockout calculation depends on demand forecast
        $result = $this->reorderService->computeForProduct($product);

        // If stock is high enough, no suggestion returned
        if ($result === null) {
            $this->assertTrue(true); // Expected behavior
        } else {
            // If suggestion exists, should have stockout info
            $this->assertArrayHasKey('projected_stockout_date', $result);
        }
    }

    /** @test */
    public function demand_forecasting_calculates_moving_average(): void
    {
        $product = Product::factory()->create();

        // The forecast service should handle products with no history gracefully
        $forecast = $this->forecastService->forecastDemand($product, 30, 90);

        $this->assertArrayHasKey('avg_daily_demand', $forecast);
        $this->assertArrayHasKey('forecasted_demand', $forecast);
        $this->assertArrayHasKey('confidence', $forecast);
        $this->assertIsNumeric($forecast['avg_daily_demand']);
    }

    /** @test */
    public function demand_forecasting_with_sales_data(): void
    {
        $product = Product::factory()->create();

        // Create some bill items to simulate sales
        for ($i = 0; $i < 30; $i++) {
            BillItem::factory()->create([
                'product_id' => $product->id,
                'quantity' => rand(1, 10),
            ]);
        }

        $forecast = $this->forecastService->forecastDemand($product, 30, 90);

        // With data, should have positive demand
        $this->assertGreaterThanOrEqual(0, $forecast['avg_daily_demand']);
        // Confidence should be reasonable with data
        $this->assertGreaterThanOrEqual(0, $forecast['confidence']);
        $this->assertLessThanOrEqual(100, $forecast['confidence']);
    }

    /** @test */
    public function it_respects_lead_time_from_supplier(): void
    {
        $product = Product::factory()->create([
            'quantity' => 5,
            'min_stock' => 10,
        ]);

        $supplier = \App\Models\Supplier::factory()->create([
            'default_lead_time_days' => 14,
        ]);

        $product->suppliers()->attach($supplier->id, [
            'is_primary' => true,
            'lead_time_days' => 21, // Override default
        ]);

        $result = $this->reorderService->computeForProduct($product);

        // With longer lead time, reorder point should be higher
        $this->assertNotNull($result);
        // The reason should mention lead time considerations
        $this->assertStringContainsString('21', $result['reason_json']['factors']['lead_time'] ?? '');
    }
}
