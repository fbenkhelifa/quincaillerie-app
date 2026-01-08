# Replenishment Assistant & Purchases Module

This document describes the intelligent inventory replenishment system implemented in the `wow/06-replenishment` branch.

---

## Overview

The Replenishment Assistant uses statistical forecasting to recommend what to reorder, when, and from which supplier. It integrates with a full Purchases workflow for creating and receiving purchase orders.

### Key Features

1. **Demand Forecasting** - Moving average & exponential smoothing algorithms
2. **Reorder Point Calculation** - Safety stock + lead time coverage
3. **Priority Ranking** - Critical/High/Medium/Low urgency levels
4. **Supplier Suggestions** - Based on primary supplier relationships
5. **Purchase Order Workflow** - Draft → Sent → Partial → Received
6. **Stock Updates** - Automatic inventory movements on receiving

---

## Database Schema

### New Tables

#### `purchase_orders`
| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| po_number | string | Unique PO identifier (PO-YYYYMM-XXXX) |
| supplier_id | FK | Supplier reference |
| user_id | FK | Created by user |
| status | enum | draft, sent, partial, received, cancelled |
| order_date | date | Order creation date |
| expected_date | date | Expected delivery date |
| received_date | date | Actual receipt date |
| subtotal | decimal | Sum of item totals |
| tax | decimal | Tax amount |
| shipping | decimal | Shipping cost |
| total | decimal | Final total |

#### `purchase_order_items`
| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| purchase_order_id | FK | Parent PO |
| product_id | FK | Product reference |
| product_name | string | Snapshot of name |
| quantity_ordered | decimal | Ordered quantity |
| quantity_received | decimal | Received so far |
| unit_cost | decimal | Cost per unit |
| total | decimal | Line total |

#### `reorder_suggestions`
| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| product_id | FK | Product reference |
| suggested_supplier_id | FK | Recommended supplier |
| recommended_qty | decimal | Suggested order quantity |
| current_stock | decimal | Stock at computation time |
| reorder_point | decimal | Calculated ROP |
| safety_stock | decimal | Calculated safety buffer |
| avg_daily_demand | decimal | Average daily sales |
| projected_stockout_date | date | Estimated stockout |
| urgency | enum | critical, high, medium, low |
| confidence | decimal | Forecast confidence 0-100 |
| reason_json | json | Explanation factors |
| forecast_data | json | Historical + projected for charts |
| status | enum | pending, approved, dismissed, ordered |

### Schema Modifications

#### `product_supplier` (pivot table)
- Added `lead_time_days` (int, default 7)
- Added `min_order_qty` (decimal, nullable)

#### `suppliers`
- Added `default_lead_time_days` (int, default 7)

---

## Forecasting Algorithms

### 1. Moving Average

Simple Moving Average (SMA) of daily sales over `n` periods:

$$
SMA_t = \frac{1}{n} \sum_{i=0}^{n-1} D_{t-i}
$$

Where $D_t$ = demand on day $t$, $n$ = number of periods (default: 14 days)

### 2. Exponential Smoothing (Holt-Winters)

For trend detection and seasonality:

$$
\hat{D}_{t+1} = \alpha \cdot D_t + (1 - \alpha) \cdot \hat{D}_t
$$

Where $\alpha$ = smoothing factor (default: 0.3)

### 3. Reorder Point (ROP)

$$
ROP = (D_{avg} \times L) + SS
$$

Where:
- $D_{avg}$ = Average daily demand
- $L$ = Lead time in days
- $SS$ = Safety Stock

### 4. Safety Stock

$$
SS = Z \times \sigma_D \times \sqrt{L}
$$

Where:
- $Z$ = Service level factor (1.65 for 95%)
- $\sigma_D$ = Standard deviation of demand
- $L$ = Lead time in days

### 5. Recommended Order Quantity

$$
Q_{rec} = ROP - Q_{current} + (D_{avg} \times T_{coverage})
$$

Where $T_{coverage}$ = days of coverage (default: 14 days)

---

## Urgency Classification

| Urgency | Condition |
|---------|-----------|
| **Critical** | Stock ≤ Safety Stock OR days to stockout ≤ 3 |
| **High** | Stock ≤ Reorder Point OR days to stockout ≤ 7 |
| **Medium** | Stock approaching reorder point |
| **Low** | Preventive reorder recommended |

---

## Artisan Commands

### Recompute All Suggestions

```bash
php artisan inventory:recompute-reorder
```

Options:
- `--sync` : Run synchronously (vs. queued job)
- `--product=ID` : Compute for single product

### Examples

```bash
# Compute for all products (queued)
php artisan inventory:recompute-reorder

# Compute synchronously (for small datasets)
php artisan inventory:recompute-reorder --sync

# Compute for single product
php artisan inventory:recompute-reorder --product=123
```

---

## Scheduler Configuration

### Automatic Nightly Computation

Add to `app/Console/Kernel.php` or `routes/console.php`:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('inventory:recompute-reorder')
    ->dailyAt('02:00')
    ->withoutOverlapping()
    ->runInBackground();
```

### Running the Scheduler in Development

```bash
# Start the scheduler worker
php artisan schedule:work

# Or run scheduled tasks once (for testing)
php artisan schedule:run
```

### Queue Worker

For queued jobs, run:

```bash
php artisan queue:work --queue=default
```

---

## API Endpoints

### Purchase Orders

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/purchases` | List all POs |
| GET | `/purchases/create` | Create form |
| POST | `/purchases` | Store new PO |
| GET | `/purchases/{id}` | View PO details |
| GET | `/purchases/{id}/edit` | Edit form |
| PUT | `/purchases/{id}` | Update PO |
| DELETE | `/purchases/{id}` | Delete PO |
| POST | `/purchases/{id}/send` | Mark as sent |
| POST | `/purchases/{id}/cancel` | Cancel PO |
| GET | `/purchases/{id}/receive` | Receive form |
| POST | `/purchases/{id}/receive` | Process receiving |
| GET | `/purchases/{id}/pdf/{lang?}` | Download PDF |

### Replenishment

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/replenishment` | View suggestions |
| GET | `/replenishment/product/{id}/forecast` | Get chart data |
| POST | `/replenishment/approve` | Approve → create PO |
| POST | `/replenishment/dismiss` | Dismiss suggestions |
| POST | `/replenishment/recompute` | Trigger recomputation |

---

## Receiving Flow

1. PO status must be `sent` or `partial`
2. User enters quantities received per item
3. System validates: `received ≤ pending`
4. For each item received:
   - Update `quantity_received` on item
   - Create `inventory_movement` (type: `purchase`)
   - Increase product `quantity`
5. Update PO status:
   - All items complete → `received`
   - Some items pending → `partial`

---

## UI Components

### Replenishment Dashboard

- **Stats Cards**: Total pending, Critical, High priority, Total value
- **Filters**: Urgency, Supplier, Min confidence
- **Data Grid**: Selectable rows, actions
- **Chart Dialog**: Historical + forecast visualization

### Purchase Order Flow

1. **Create**: Select supplier, add products, set costs
2. **Show**: View details, send to supplier
3. **Receive**: Enter received quantities, confirm
4. **PDF**: Generate printable purchase order

---

## Extensibility: LLM Integration

The architecture supports plugging in an LLM provider for enhanced explanations:

```php
// app/Services/Replenishment/LlmExplanationService.php (future)

interface ExplanationProviderInterface
{
    public function generateExplanation(array $factors): string;
}

class StatisticalExplanationProvider implements ExplanationProviderInterface
{
    // Current implementation - template-based
}

class LlmExplanationProvider implements ExplanationProviderInterface
{
    // Future - call OpenAI/Claude API
}
```

Configuration in `.env`:

```env
REPLENISHMENT_EXPLANATION_DRIVER=statistical  # or 'llm'
OPENAI_API_KEY=sk-xxx  # if using LLM
```

---

## Testing

### Run Tests

```bash
# All tests
php artisan test

# Specific test files
php artisan test tests/Feature/PurchaseOrderReceiveTest.php
php artisan test tests/Unit/ReorderCalculationTest.php
```

### Test Coverage

- **PurchaseOrderReceiveTest**: Receiving flow, stock updates, status transitions
- **ReorderCalculationTest**: ROP formulas, urgency classification, supplier suggestions

---

## Quick Start for Teachers

1. **Run migrations**: `php artisan migrate`
2. **Seed sample data** (if available): `php artisan db:seed`
3. **Generate suggestions**: `php artisan inventory:recompute-reorder --sync`
4. **Navigate to**: `http://127.0.0.1:8000/replenishment`
5. **Select suggestions** and click "Créer commande"
6. **Complete PO** and send to supplier
7. **Receive items** when delivered

Total time: ~2 minutes from viewing suggestions to completed purchase order.

---

## Migrations

Run in order:
```bash
php artisan migrate
```

Migration files:
- `2024_01_03_000001_create_purchase_orders_table.php`
- `2024_01_03_000002_create_purchase_order_items_table.php`
- `2024_01_03_000003_create_reorder_suggestions_table.php`
- `2024_01_03_000004_add_lead_time_to_suppliers.php`
