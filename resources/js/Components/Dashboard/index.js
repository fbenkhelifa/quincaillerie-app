/**
 * Dashboard Components Index
 * ==========================
 * Central export point for dashboard-specific components.
 */

export { default as DashboardFilterBar } from './DashboardFilterBar';
export { default as DashboardKPIGrid } from './DashboardKPIGrid';
export { default as RecommendedActionsPanel } from './RecommendedActionsPanel';

export {
    RevenueTimelineChart,
    PaymentMethodsChart,
    TopProductsChart,
    StockRiskChart,
    MovementsTimelineChart,
    AlertsSeverityChart,
} from './DashboardCharts';
