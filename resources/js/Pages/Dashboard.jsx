/**
 * Dashboard - Premium Analytics Cockpit
 * ======================================
 * Comprehensive analytics dashboard with KPIs, charts, and actionable insights.
 */

import { useContext, useState, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '@/app';
import { EmptyState } from '@/Components/ui';
import {
    DashboardFilterBar,
    DashboardKPIGrid,
    RecommendedActionsPanel,
    RevenueTimelineChart,
    PaymentMethodsChart,
    TopProductsChart,
    StockRiskChart,
    MovementsTimelineChart,
    AlertsSeverityChart,
} from '@/Components/Dashboard';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Button,
    Tabs,
    Tab,
    Chip,
    alpha,
    useTheme,
    useMediaQuery,
    Fade,
} from '@mui/material';
import {
    Add as AddIcon,
    Receipt as ReceiptIcon,
    TrendingUp as TrendingUpIcon,
    Inventory as InventoryIcon,
    Speed as SpeedIcon,
    Cached as CachedIcon,
} from '@mui/icons-material';

export default function Dashboard({
    dashboardData = {},
    filterOptions = {},
    currentFilters = {},
}) {
    const { t, locale } = useContext(AppContext);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const { kpis = {}, charts = {}, recommended_actions = {}, meta = {} } = dashboardData;

    const formatCurrency = useCallback((value) => {
        return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value || 0) + ' DA';
    }, [locale]);

    const handleRefresh = useCallback(() => {
        setLoading(true);
        router.reload({
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
    }, []);

    // Determine if we have data
    const hasData = Object.keys(kpis).length > 0 || Object.keys(charts).length > 0;

    return (
        <Layout
            title={t('Tableau de bord')}
            breadcrumbs={[{ label: t('Tableau de bord') }]}
        >
            <Head title={t('Tableau de bord')} />

            {/* Quick Actions Bar */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                    component={Link}
                    href={route('products.create')}
                    variant="contained"
                    startIcon={<AddIcon />}
                    size={isMobile ? 'medium' : 'large'}
                >
                    {t('Nouveau produit')}
                </Button>
                <Button
                    component={Link}
                    href={route('bills.create')}
                    variant="outlined"
                    startIcon={<ReceiptIcon />}
                    size={isMobile ? 'medium' : 'large'}
                >
                    {t('Nouvelle facture')}
                </Button>

                <Box sx={{ flex: 1 }} />

                {/* Cache indicator */}
                {meta.cached_at && (
                    <Chip
                        icon={<CachedIcon sx={{ fontSize: 16 }} />}
                        label={t('Données en cache')}
                        size="small"
                        variant="outlined"
                        sx={{ opacity: 0.7 }}
                    />
                )}
            </Box>

            {/* Global Filter Bar */}
            <DashboardFilterBar
                currentFilters={currentFilters}
                filterOptions={filterOptions}
                onRefresh={handleRefresh}
                loading={loading}
            />

            {!hasData ? (
                <EmptyState
                    type="empty"
                    title={t('Aucune donnée disponible')}
                    description={t('Commencez par créer des factures pour voir les analytics')}
                    action={{
                        label: t('Créer une facture'),
                        href: route('bills.create'),
                    }}
                />
            ) : (
                <Fade in timeout={300}>
                    <Box>
                        {/* KPI Cards Grid */}
                        <DashboardKPIGrid kpis={kpis} loading={loading} />

                        {/* Charts Section with Tabs */}
                        <Paper
                            elevation={0}
                            sx={{
                                mb: 3,
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                overflow: 'hidden',
                            }}
                        >
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                                <Tabs
                                    value={activeTab}
                                    onChange={(_, v) => setActiveTab(v)}
                                    variant={isMobile ? 'scrollable' : 'standard'}
                                    scrollButtons="auto"
                                >
                                    <Tab
                                        icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
                                        iconPosition="start"
                                        label={t('Ventes')}
                                    />
                                    <Tab
                                        icon={<InventoryIcon sx={{ fontSize: 18 }} />}
                                        iconPosition="start"
                                        label={t('Stock')}
                                    />
                                    <Tab
                                        icon={<SpeedIcon sx={{ fontSize: 18 }} />}
                                        iconPosition="start"
                                        label={t('Performance')}
                                    />
                                </Tabs>
                            </Box>

                            <Box sx={{ p: 3 }}>
                                {/* Sales Tab */}
                                {activeTab === 0 && (
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} lg={8}>
                                            <RevenueTimelineChart
                                                data={charts.revenue_timeline || []}
                                                loading={loading}
                                            />
                                        </Grid>
                                        <Grid item xs={12} lg={4}>
                                            <PaymentMethodsChart
                                                data={charts.payment_methods || []}
                                                loading={loading}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TopProductsChart
                                                data={charts.top_products || []}
                                                loading={loading}
                                            />
                                        </Grid>
                                    </Grid>
                                )}

                                {/* Stock Tab */}
                                {activeTab === 1 && (
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} lg={6}>
                                            <StockRiskChart
                                                data={charts.stock_risk || []}
                                                loading={loading}
                                            />
                                        </Grid>
                                        <Grid item xs={12} lg={6}>
                                            <MovementsTimelineChart
                                                data={charts.movements_timeline || []}
                                                loading={loading}
                                            />
                                        </Grid>
                                    </Grid>
                                )}

                                {/* Performance Tab */}
                                {activeTab === 2 && (
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} lg={8}>
                                            <AlertsSeverityChart
                                                data={charts.alerts_severity || []}
                                                loading={loading}
                                            />
                                        </Grid>
                                        <Grid item xs={12} lg={4}>
                                            <Card sx={{ height: '100%' }}>
                                                <CardContent>
                                                    <Typography variant="h6" fontWeight={600} mb={2}>
                                                        {t('Résumé de la période')}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                        <SummaryItem
                                                            label={t('Période analysée')}
                                                            value={`${currentFilters.start_date || '-'} → ${currentFilters.end_date || '-'}`}
                                                        />
                                                        <SummaryItem
                                                            label={t('Chiffre d\'affaires')}
                                                            value={formatCurrency(kpis.find(k => k.key === 'revenue')?.value)}
                                                            color="success.main"
                                                        />
                                                        <SummaryItem
                                                            label={t('Nombre de factures')}
                                                            value={kpis.find(k => k.key === 'bills_count')?.value || 0}
                                                        />
                                                        <SummaryItem
                                                            label={t('Articles en rupture')}
                                                            value={kpis.find(k => k.key === 'low_stock')?.value || 0}
                                                            color={kpis.find(k => k.key === 'low_stock')?.value > 0 ? 'warning.main' : 'text.primary'}
                                                        />
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    </Grid>
                                )}
                            </Box>
                        </Paper>

                        {/* Recommended Actions Panel */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} lg={8}>
                                <RecommendedActionsPanel
                                    reorderSuggestions={recommended_actions.reorder_suggestions || []}
                                    alerts={recommended_actions.alerts || []}
                                    deadStock={recommended_actions.dead_stock || []}
                                    loading={loading}
                                />
                            </Grid>

                            {/* Quick Links */}
                            <Grid item xs={12} lg={4}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight={600} mb={2}>
                                            {t('Accès rapide')}
                                        </Typography>
                                        <Grid container spacing={1}>
                                            <Grid item xs={6}>
                                                <QuickLinkButton
                                                    href={route('analytics.sales')}
                                                    icon={<TrendingUpIcon />}
                                                    label={t('Analytics ventes')}
                                                    color="primary"
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <QuickLinkButton
                                                    href={route('analytics.inventory')}
                                                    icon={<InventoryIcon />}
                                                    label={t('Analytics stock')}
                                                    color="info"
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <QuickLinkButton
                                                    href={route('replenishment.index')}
                                                    icon={<SpeedIcon />}
                                                    label={t('Réapprovisionnement')}
                                                    color="warning"
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <QuickLinkButton
                                                    href={route('findings.index')}
                                                    icon={<SpeedIcon />}
                                                    label={t('Anomalies')}
                                                    color="error"
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                </Fade>
            )}
        </Layout>
    );
}

/**
 * Summary Item Component
 */
function SummaryItem({ label, value, color = 'text.primary' }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={600} color={color}>
                {value}
            </Typography>
        </Box>
    );
}

/**
 * Quick Link Button Component
 */
function QuickLinkButton({ href, icon, label, color = 'primary' }) {
    const theme = useTheme();
    const colorValue = theme.palette[color]?.main || color;

    return (
        <Button
            component={Link}
            href={href}
            fullWidth
            sx={{
                flexDirection: 'column',
                py: 2,
                gap: 1,
                bgcolor: alpha(colorValue, 0.1),
                color: colorValue,
                '&:hover': {
                    bgcolor: alpha(colorValue, 0.2),
                },
            }}
        >
            {icon}
            <Typography variant="caption" fontWeight={500} textAlign="center">
                {label}
            </Typography>
        </Button>
    );
}
