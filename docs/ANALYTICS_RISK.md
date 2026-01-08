# Analytics & Risk Management Module

## Overview

The Analytics & Risk module provides comprehensive business intelligence and security monitoring for the hardware store application. It includes sales analytics, inventory intelligence, anomaly detection, and a complete audit trail system.

## Features

### 1. Sales Analytics

**Route:** `/analytics/sales`

Provides deep insights into sales performance:

#### KPI Cards
- **Chiffre d'affaires** - Total revenue with period comparison
- **Nombre de factures** - Order count with trend
- **Panier moyen** - Average basket size
- **Annulations** - Cancellation rate and count

#### Charts
- **Daily Revenue Line Chart** - Revenue trends over time with configurable periods (daily/weekly/monthly)
- **Payment Methods Pie Chart** - Cash, card, check distribution
- **Top Products (Pareto)** - Top 10 products contributing to 80% of sales
- **Category Performance Bar Chart** - Revenue by product category
- **Hourly Sales Heatmap** - Activity patterns by day and hour
- **Cashier Performance** - Sales per employee

#### Filters
- Date range selection
- Period aggregation (daily, weekly, monthly)
- Export functionality

### 2. Inventory Intelligence

**Route:** `/analytics/inventory`

Comprehensive stock analysis:

#### KPI Cards
- **Valeur totale du stock** - Cost value of inventory
- **Valeur au prix de vente** - Retail value with potential margin
- **Produits en rupture** - Out of stock count
- **Stock dormant** - Dead stock count (>90 days without movement)

#### Features
- **Valuation History** - Stock value trends over 90 days
- **Stock by Category** - Distribution pie chart
- **Inventory Turnover Table** - Turnover ratio analysis with status indicators
- **Dead Stock Table** - Products without movement, blocked value
- **Stock Movements Summary** - Total in/out with net variation

### 3. Anomaly Detection

**Route:** `/findings`

Automated detection of suspicious patterns:

#### Anomaly Types
| Type | Description | Default Threshold |
|------|-------------|-------------------|
| `repeated_cancellation` | User cancels too many bills | 3 in 7 days |
| `negative_stock` | Product has negative quantity | Any |
| `large_adjustment` | Stock adjustment > 50% of total | 50% |
| `high_discount` | Discount exceeds allowed limit | 25% |
| `unusual_void` | Cancellations outside business hours | Night hours |
| `price_override` | Significant price change | 30% |
| `dead_stock` | No movement for extended period | 90 days |
| `stock_discrepancy` | System vs physical count mismatch | Any |

#### Severity Levels
- **Critical** - Immediate attention required
- **High** - Should investigate soon
- **Medium** - Review when possible
- **Low** - Informational

#### Status Workflow
1. `new` - Just detected
2. `investigating` - Under review
3. `resolved` - Issue addressed
4. `dismissed` - False positive

#### Features
- Bulk status updates
- Expandable detail view
- Filter by type, severity, status
- Impact value calculation
- Resolution notes

### 4. Audit Trail

**Route:** `/audit-log`

Complete traceability of critical actions:

#### Tracked Actions
- `created` - New entity created
- `updated` - Entity modified
- `deleted` - Entity removed
- `cancelled` - Bill/order cancelled
- `adjusted` - Stock adjustment
- `received` - Purchase order received
- `sent` - Document sent

#### Features
- Full JSON diff (old/new values)
- User identification with IP address
- Metadata storage for context
- Search and filter capabilities
- Export functionality

## Database Schema

### anomaly_findings
```sql
CREATE TABLE anomaly_findings (
    id BIGINT PRIMARY KEY,
    type VARCHAR(50),              -- Anomaly type
    severity ENUM('critical', 'high', 'medium', 'low'),
    entity_type VARCHAR(255),      -- Polymorphic entity
    entity_id BIGINT,
    title VARCHAR(255),
    explanation TEXT,
    metadata JSON,                 -- Flexible details
    impact_value DECIMAL(15,2),    -- Financial impact
    status ENUM('new', 'investigating', 'resolved', 'dismissed'),
    detected_at TIMESTAMP,
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    reviewed_by BIGINT,            -- User FK
    timestamps
);
```

### audit_logs
```sql
CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    user_name VARCHAR(255),        -- Denormalized for history
    action VARCHAR(50),
    event TEXT,
    auditable_type VARCHAR(255),   -- Polymorphic
    auditable_id BIGINT,
    old_values JSON,
    new_values JSON,
    reason TEXT,
    metadata JSON,
    ip_address VARCHAR(45),
    timestamps
);
```

### analytics_snapshots
```sql
CREATE TABLE analytics_snapshots (
    id BIGINT PRIMARY KEY,
    date DATE,
    type VARCHAR(50),              -- 'sales' or 'inventory'
    metrics JSON,                  -- All KPIs for that day
    timestamps,
    UNIQUE(date, type)
);
```

## Backend Services

### SalesAnalyticsService

```php
use App\Services\Analytics\SalesAnalyticsService;

$service = app(SalesAnalyticsService::class);

// Get KPIs
$kpis = $service->getKPIs($startDate, $endDate);

// Get chart data
$dailyRevenue = $service->getDailyRevenue($startDate, $endDate, 'daily');
$paymentSplit = $service->getPaymentMethodSplit($startDate, $endDate);
$topProducts = $service->getTopProducts($startDate, $endDate, 10);
$categoryPerf = $service->getCategoryPerformance($startDate, $endDate);
$hourlySales = $service->getHourlySales($startDate, $endDate);
$cashierPerf = $service->getCashierPerformance($startDate, $endDate);

// Filterable table
$salesTable = $service->getSalesTable($startDate, $endDate, $filters);
```

### InventoryAnalyticsService

```php
use App\Services\Analytics\InventoryAnalyticsService;

$service = app(InventoryAnalyticsService::class);

// Current state
$valuation = $service->getCurrentValuation();

// Historical data
$history = $service->getValuationHistory($startDate, $endDate);
$turnover = $service->getInventoryTurnover($startDate, $endDate, 20);

// Alerts
$deadStock = $service->getDeadStock(90, 50); // 90 days, top 50
$lowStock = $service->getLowStockAlerts(30);

// Movements
$movements = $service->getStockMovements($startDate, $endDate);
```

## Queued Jobs

### DetectAnomaliesJob

Runs comprehensive anomaly detection:

```php
use App\Jobs\DetectAnomaliesJob;

// Default thresholds
DetectAnomaliesJob::dispatch();

// Custom thresholds
DetectAnomaliesJob::dispatch(
    cancellationThreshold: 5,
    adjustmentThreshold: 0.6,
    discountThreshold: 0.30,
    deadStockDays: 120
);
```

**Recommended scheduling:**
```php
// app/Console/Kernel.php
$schedule->job(new DetectAnomaliesJob)->hourly();
```

### ComputeDailyAnalyticsJob

Saves daily snapshots for historical charts:

```php
use App\Jobs\ComputeDailyAnalyticsJob;

ComputeDailyAnalyticsJob::dispatch(now());
```

**Recommended scheduling:**
```php
$schedule->job(new ComputeDailyAnalyticsJob)->dailyAt('23:55');
```

## Events & Listeners

The module uses Laravel events for real-time audit logging:

### Events
| Event | Trigger | Payload |
|-------|---------|---------|
| `BillCancelled` | Bill cancelled | Bill model, reason |
| `StockAdjusted` | Inventory movement | InventoryMovement, reason |
| `PurchaseReceived` | PO received | PurchaseOrder, items |
| `ProductPriceChanged` | Price update | Product, old/new price, reason |

### Usage
```php
use App\Events\BillCancelled;
use App\Events\ProductPriceChanged;

// When cancelling a bill
event(new BillCancelled($bill, 'Customer request'));

// When changing price
event(new ProductPriceChanged(
    product: $product,
    oldPrice: 450.00,
    newPrice: 280.00,
    reason: 'Promotion été'
));
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/analytics/sales` | Sales dashboard |
| GET | `/analytics/sales/table` | Filterable sales table |
| GET | `/analytics/inventory` | Inventory dashboard |
| GET | `/analytics/export` | Export data |
| POST | `/analytics/refresh` | Trigger manual refresh |
| GET | `/findings` | Anomaly list |
| GET | `/findings/stats` | Anomaly statistics |
| GET | `/findings/{id}` | Anomaly detail |
| PATCH | `/findings/{id}/status` | Update status |
| POST | `/findings/bulk-update` | Bulk status update |
| GET | `/audit-log` | Audit log list |
| GET | `/audit-log/export` | Export audit log |
| GET | `/audit-log/timeline` | Entity timeline |
| GET | `/audit-log/{id}` | Log detail |

## React Components

### Chart Components

Located in `resources/js/Components/ui/Charts.jsx`:

```jsx
import { LineChart, BarChart, PieChart, HorizontalBarChart, HeatmapChart } from '@/Components/ui';

// Line chart
<LineChart
    data={dailyRevenue}
    series={[
        { key: 'revenue', color: '#1976d2', label: 'Revenue' },
    ]}
    height={300}
    xAxisKey="date"
    formatValue={(v) => `${v.toLocaleString()} DA`}
/>

// Pie chart (donut)
<PieChart
    data={paymentMethods}
    donut
    height={250}
/>

// Horizontal bar (rankings)
<HorizontalBarChart
    data={topProducts}
    valueKey="revenue"
    labelKey="name"
    formatValue={(v) => `${v} DA`}
/>

// Heatmap (hourly activity)
<HeatmapChart
    data={hourlySales}
    valueKey="total"
    height={200}
/>
```

## Demo Data

Run the seeder to populate demo data:

```bash
php artisan db:seed --class=AnalyticsDemoSeeder
```

This creates:
- 7+ anomaly findings of various types and severities
- 50 audit log entries over 7 days
- 90 days of sales snapshots
- 90 days of inventory snapshots

## Caching Strategy

Analytics data is cached for performance:

- **TTL:** 5 minutes (300 seconds)
- **Keys:** Scoped by date range and filters
- **Invalidation:** Manual via refresh endpoint

```php
// Clear analytics cache
Cache::tags(['analytics'])->flush();
```

## Security Considerations

1. **Access Control:** All routes require authentication
2. **IP Logging:** Every audit entry captures IP address
3. **Immutable Logs:** Audit logs cannot be modified or deleted via UI
4. **Sensitive Data:** Passwords and tokens excluded from diffs

## Future Enhancements

- [ ] Email alerts for critical anomalies
- [ ] PDF report generation
- [ ] Machine learning for anomaly detection
- [ ] Real-time WebSocket updates
- [ ] Role-based dashboard access
- [ ] Custom alert thresholds in settings
