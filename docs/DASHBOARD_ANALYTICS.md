# Dashboard Analytics - Technical Documentation

## Overview

The Dashboard Analytics module transforms the basic dashboard into a premium analytics cockpit with real-time KPIs, interactive charts, and actionable recommendations.

## Architecture

### Backend

```
app/
├── Services/
│   └── DashboardAnalyticsService.php  # Main analytics service
├── Http/Controllers/
│   └── DashboardController.php        # Updated controller
├── Observers/
│   └── DashboardCacheObserver.php     # Cache invalidation
└── Providers/
    └── AppServiceProvider.php         # Observer registration
```

### Frontend

```
resources/js/
├── Components/Dashboard/
│   ├── index.js                    # Component exports
│   ├── DashboardFilterBar.jsx      # Global filter bar
│   ├── DashboardKPIGrid.jsx        # KPI cards grid
│   ├── DashboardCharts.jsx         # Recharts components
│   └── RecommendedActionsPanel.jsx # Actions panel
└── Pages/
    └── Dashboard.jsx               # Main dashboard page
```

## Features

### 1. Global Filter Bar

**Location**: Top of dashboard

**Filters Available**:
| Filter | Type | Options |
|--------|------|---------|
| Date Preset | ButtonGroup | Today, 7d, 30d, 90d, MTD, YTD, Custom |
| Worker | Select | All workers |
| Payment Method | Select | cash, card, check, credit, other |
| Category | Select | All categories |

**Behavior**:
- Date presets update URL parameters immediately
- Advanced filters available in collapsible panel
- Active filters shown as chips with quick remove
- All filters affect all KPIs and charts

### 2. KPI Cards (6 metrics)

| KPI | Key | Description | Trend |
|-----|-----|-------------|-------|
| Revenue | `revenue` | Total completed bill amounts | % vs previous period |
| Bills Count | `bills_count` | Number of completed bills | % vs previous period |
| Average Basket | `avg_basket` | Revenue / Bills Count | % vs previous period |
| Items Sold | `items_sold` | Sum of all bill item quantities | % vs previous period |
| Low Stock | `low_stock` | Products below min_stock | % vs previous period |
| Gross Margin | `gross_margin` | (Revenue - Cost) / Revenue × 100 | pp vs previous period |

Each KPI includes:
- Current value (formatted)
- Trend indicator (↑/↓/→)
- Percentage change vs comparison period
- Optional sparkline (last 7 days)

### 3. Charts (Recharts)

#### Sales Tab
1. **Revenue Timeline** (Line/Area/Bar chart)
   - Daily revenue for selected period
   - Toggle between chart types
   
2. **Payment Methods** (Pie chart)
   - Distribution by payment method
   - Value and percentage

3. **Top 10 Products** (Horizontal bar chart)
   - Revenue by product
   - Pareto line (cumulative %)

#### Stock Tab
4. **Stock Risk by Category** (Stacked bar chart)
   - Categories with ok/low/out-of-stock counts
   
5. **Movements Timeline** (Area chart)
   - Daily inventory ins/outs

#### Performance Tab
6. **Alerts by Severity** (Stacked bar chart)
   - Daily alerts by severity level

### 4. Recommended Actions Panel

Three types of recommendations:
1. **Reorder Suggestions** - Products needing replenishment
2. **Critical Alerts** - Anomalies requiring attention  
3. **Dead Stock** - Products with no sales (90+ days)

## API

### Dashboard Index
```
GET /
```

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| date_preset | string | '30d' | Preset period |
| start_date | date | auto | Custom start date |
| end_date | date | auto | Custom end date |
| worker_id | int | null | Filter by worker |
| payment_method | string | null | Filter by payment |
| category_id | int | null | Filter by category |

**Response** (Inertia):
```javascript
{
  dashboardData: {
    kpis: [...],           // Array of KPI objects
    charts: {
      revenue_timeline: [...],
      payment_methods: [...],
      top_products: [...],
      stock_risk: [...],
      movements_timeline: [...],
      alerts_severity: [...]
    },
    recommended_actions: {
      reorder_suggestions: [...],
      alerts: [...],
      dead_stock: [...]
    },
    meta: {
      period: { start, end },
      cached_at: '...'
    }
  },
  filterOptions: {
    workers: [...],
    payment_methods: [...],
    categories: [...]
  },
  currentFilters: {...}
}
```

### Dashboard Refresh (API)
```
GET /dashboard/refresh
```
Returns JSON response (same structure as dashboardData).

## Caching Strategy

### Cache Key Structure
```
dashboard:analytics:{hash}
```
Where `hash` is MD5 of filter parameters.

### TTL
- Default: 10 minutes
- Invalidated on: Bill create/update/delete

### Cache Invalidation
```php
// Manual invalidation
DashboardAnalyticsService::invalidateCache();

// Automatic via observer
Bill::observe(DashboardCacheObserver::class);
```

## Database Indexes

Migration: `2024_01_01_100000_add_dashboard_performance_indexes.php`

| Table | Index | Columns |
|-------|-------|---------|
| bills | bills_status_created_at_idx | status, created_at |
| bills | bills_worker_created_at_idx | worker_id, created_at |
| bills | bills_payment_method_created_at_idx | payment_method, created_at |
| bill_items | bill_items_product_created_at_idx | product_id, created_at |
| products | products_stock_analysis_idx | category_id, quantity, min_stock |
| inventory_movements | inventory_movements_type_created_at_idx | type, created_at |

## Performance Considerations

1. **Query Optimization**: All heavy queries use DB aggregates
2. **Caching**: 10-minute cache with smart invalidation
3. **Lazy Loading**: Charts loaded on tab switch
4. **Skeleton States**: Loading states for all components
5. **Indexes**: Composite indexes for common filter patterns

## Testing

```bash
# Run dashboard tests
php artisan test --filter=Dashboard

# Test specific component
php artisan test --filter=DashboardAnalyticsServiceTest
```

## Customization

### Adding New KPIs
1. Add method to `DashboardAnalyticsService::getKPIs()`
2. Add config to `DashboardKPIGrid.jsx` → `KPI_CONFIG`

### Adding New Charts
1. Add method to service (e.g., `getNewChart()`)
2. Include in `getDashboardData()` charts array
3. Create React component in `DashboardCharts.jsx`
4. Add to Dashboard.jsx in appropriate tab

### Changing Date Presets
Edit `DATE_PRESETS` in `DashboardFilterBar.jsx`

## Translations

All strings are translatable. Add new keys to:
- `lang/fr.json`
- `lang/ar.json`
