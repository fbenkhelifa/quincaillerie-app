import { useContext, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../../app';
import {
    StatCard,
    PageHeader,
    LineChart,
    PieChart,
    HorizontalBarChart,
    BarChart,
    HeatmapChart,
} from '@/Components/ui';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    CardHeader,
    TextField,
    Button,
    ButtonGroup,
    Chip,
    Divider,
    alpha,
    useTheme,
    Tab,
    Tabs,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    TrendingUp as RevenueIcon,
    Receipt as OrdersIcon,
    ShoppingBasket as BasketIcon,
    RemoveCircle as CancelIcon,
    Refresh as RefreshIcon,
    Download as ExportIcon,
    DateRange as DateRangeIcon,
    BarChart as ChartIcon,
    Category as CategoryIcon,
    Person as CashierIcon,
    Schedule as HourlyIcon,
} from '@mui/icons-material';

export default function Sales({
    kpis,
    dailyRevenue,
    paymentMethods,
    topProducts,
    categoryPerformance,
    hourlySales,
    cashierPerformance,
    filters,
}) {
    const { t, locale } = useContext(AppContext);
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [period, setPeriod] = useState(filters.period);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value || 0) + ' DA';
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ').format(value || 0);
    };

    const applyFilters = () => {
        router.get(route('analytics.sales'), {
            start_date: startDate,
            end_date: endDate,
            period,
        }, { preserveState: true });
    };

    const refreshData = () => {
        router.post(route('analytics.refresh'), { type: 'analytics' });
    };

    const handleExport = () => {
        window.open(route('analytics.export', { type: 'sales', start_date: startDate, end_date: endDate }));
    };

    return (
        <Layout
            title={t('Analyse des ventes')}
            breadcrumbs={[
                { label: t('Analytics') },
                { label: t('Ventes') },
            ]}
        >
            <Head title={t('Analyse des ventes')} />

            {/* Header with filters */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={600} gutterBottom>
                            {t('Analyse des ventes')}
                        </Typography>
                        <Typography color="text.secondary">
                            {t('Vue d\'ensemble de la performance commerciale')}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={t('Actualiser')}>
                            <IconButton onClick={refreshData}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('Exporter')}>
                            <IconButton onClick={handleExport}>
                                <ExportIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Date range filters */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <DateRangeIcon color="action" />
                        <TextField
                            type="date"
                            label={t('Date début')}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            type="date"
                            label={t('Date fin')}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                        <Divider orientation="vertical" flexItem />
                        <ButtonGroup size="small">
                            <Button
                                variant={period === 'daily' ? 'contained' : 'outlined'}
                                onClick={() => setPeriod('daily')}
                            >
                                {t('Jour')}
                            </Button>
                            <Button
                                variant={period === 'weekly' ? 'contained' : 'outlined'}
                                onClick={() => setPeriod('weekly')}
                            >
                                {t('Semaine')}
                            </Button>
                            <Button
                                variant={period === 'monthly' ? 'contained' : 'outlined'}
                                onClick={() => setPeriod('monthly')}
                            >
                                {t('Mois')}
                            </Button>
                        </ButtonGroup>
                        <Button variant="contained" onClick={applyFilters}>
                            {t('Appliquer')}
                        </Button>
                    </Box>
                </Paper>
            </Box>

            {/* KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title={t('Chiffre d\'affaires')}
                        value={formatCurrency(kpis.total_revenue)}
                        icon={<RevenueIcon sx={{ fontSize: 28 }} />}
                        color="primary"
                        trend={kpis.revenue_change}
                        subtitle={t('vs période précédente')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title={t('Nombre de factures')}
                        value={formatNumber(kpis.total_orders)}
                        icon={<OrdersIcon sx={{ fontSize: 28 }} />}
                        color="info"
                        trend={kpis.orders_change}
                        subtitle={t('vs période précédente')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title={t('Panier moyen')}
                        value={formatCurrency(kpis.average_order)}
                        icon={<BasketIcon sx={{ fontSize: 28 }} />}
                        color="success"
                        trend={kpis.average_change}
                        subtitle={t('par facture')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title={t('Annulations')}
                        value={formatNumber(kpis.cancellations)}
                        icon={<CancelIcon sx={{ fontSize: 28 }} />}
                        color="error"
                        subtitle={`${kpis.cancellation_rate?.toFixed(1) || 0}% ${t('du total')}`}
                    />
                </Grid>
            </Grid>

            {/* Main Charts */}
            <Grid container spacing={3}>
                {/* Revenue Chart */}
                <Grid item xs={12} lg={8}>
                    <Card>
                        <CardHeader
                            title={t('Évolution du chiffre d\'affaires')}
                            avatar={<ChartIcon color="primary" />}
                        />
                        <CardContent>
                            <LineChart
                                data={dailyRevenue}
                                series={[
                                    { key: 'revenue', color: theme.palette.primary.main, label: t('CA') },
                                    { key: 'orders', color: theme.palette.info.main, label: t('Commandes') },
                                ]}
                                height={350}
                                xAxisKey="date"
                                formatValue={(v) => formatCurrency(v)}
                                formatLabel={(d) => d?.substring(5) || ''}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Payment Methods */}
                <Grid item xs={12} lg={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardHeader
                            title={t('Répartition par mode de paiement')}
                        />
                        <CardContent>
                            <PieChart
                                data={paymentMethods.map(pm => ({
                                    label: pm.method === 'cash' ? t('Espèces') :
                                           pm.method === 'card' ? t('Carte') :
                                           pm.method === 'check' ? t('Chèque') : pm.method,
                                    value: pm.total,
                                    color: pm.method === 'cash' ? theme.palette.success.main :
                                           pm.method === 'card' ? theme.palette.primary.main :
                                           pm.method === 'check' ? theme.palette.warning.main : theme.palette.grey[500],
                                }))}
                                donut
                                height={250}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Top Products */}
                <Grid item xs={12} lg={6}>
                    <Card>
                        <CardHeader
                            title={t('Top 10 produits')}
                            subheader={t('Analyse Pareto - 80/20')}
                        />
                        <CardContent>
                            <HorizontalBarChart
                                data={topProducts}
                                valueKey="revenue"
                                labelKey="name"
                                formatValue={(v) => formatCurrency(v)}
                                height={400}
                                color={theme.palette.primary.main}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Category Performance */}
                <Grid item xs={12} lg={6}>
                    <Card>
                        <CardHeader
                            title={t('Performance par catégorie')}
                            avatar={<CategoryIcon color="primary" />}
                        />
                        <CardContent>
                            <BarChart
                                data={categoryPerformance}
                                series={[
                                    { key: 'revenue', color: theme.palette.primary.main, label: t('CA') },
                                ]}
                                height={400}
                                labelKey="name"
                                formatValue={(v) => formatCurrency(v)}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Hourly Sales Heatmap */}
                <Grid item xs={12} lg={6}>
                    <Card>
                        <CardHeader
                            title={t('Répartition horaire des ventes')}
                            avatar={<HourlyIcon color="primary" />}
                            subheader={t('Activité par jour et heure')}
                        />
                        <CardContent>
                            <HeatmapChart
                                data={hourlySales}
                                valueKey="total"
                                formatValue={(v) => formatCurrency(v)}
                                height={200}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Cashier Performance */}
                <Grid item xs={12} lg={6}>
                    <Card>
                        <CardHeader
                            title={t('Performance des caissiers')}
                            avatar={<CashierIcon color="primary" />}
                        />
                        <CardContent>
                            <HorizontalBarChart
                                data={cashierPerformance}
                                valueKey="total_revenue"
                                labelKey="name"
                                formatValue={(v) => formatCurrency(v)}
                                height={200}
                                color={theme.palette.secondary.main}
                            />
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {cashierPerformance?.slice(0, 3).map((cashier, i) => (
                                    <Chip
                                        key={i}
                                        label={`${cashier.name}: ${formatNumber(cashier.total_bills)} ${t('factures')}`}
                                        size="small"
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Layout>
    );
}
