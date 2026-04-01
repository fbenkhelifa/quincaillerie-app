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
    EmptyState,
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
    Chip,
    Divider,
    alpha,
    useTheme,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    IconButton,
    Tooltip,
    Alert,
    AlertTitle,
} from '@mui/material';
import {
    Inventory as StockIcon,
    TrendingUp as TurnoverIcon,
    Warning as AlertIcon,
    AccessTime as DeadStockIcon,
    Refresh as RefreshIcon,
    Download as ExportIcon,
    DateRange as DateRangeIcon,
    ArrowUpward,
    ArrowDownward,
    Category as CategoryIcon,
} from '@mui/icons-material';

export default function Inventory({
    valuation,
    valuationHistory,
    turnover,
    deadStock,
    movements,
    lowStockAlerts,
    filters,
}) {
    const { t, locale } = useContext(AppContext);
    const theme = useTheme();
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [refreshing, setRefreshing] = useState(false);

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
        router.get(route('analytics.inventory'), {
            start_date: startDate,
            end_date: endDate,
        }, { preserveState: true });
    };

    const refreshData = async () => {
        setRefreshing(true);
        try {
            await window.axios.post(route('analytics.refresh'), { type: 'analytics' });
            // Reload the page to get fresh data
            router.reload({ preserveScroll: true, onFinish: () => setRefreshing(false) });
        } catch (error) {
            console.error('Refresh failed:', error);
            setRefreshing(false);
        }
    };

    const handleExport = () => {
        window.open(route('analytics.export', { type: 'inventory', start_date: startDate, end_date: endDate }));
    };

    const getTurnoverColor = (ratio) => {
        if (ratio >= 6) return 'success';
        if (ratio >= 3) return 'warning';
        return 'error';
    };

    const getTurnoverLabel = (ratio) => {
        if (ratio >= 6) return t('Excellent');
        if (ratio >= 3) return t('Correct');
        if (ratio >= 1) return t('Faible');
        return t('Critique');
    };

    return (
        <Layout
            title={t('Intelligence inventaire')}
            breadcrumbs={[
                { label: t('Analytics') },
                { label: t('Inventaire') },
            ]}
        >
            <Head title={t('Intelligence inventaire')} />

            {/* Header with filters */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={600} gutterBottom>
                            {t('Intelligence inventaire')}
                        </Typography>
                        <Typography color="text.secondary">
                            {t('Analyse de la valeur et rotation du stock')}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={t('Actualiser')}>
                            <IconButton 
                                onClick={refreshData} 
                                disabled={refreshing}
                                sx={{
                                    animation: refreshing ? 'spin 1s linear infinite' : 'none',
                                    '@keyframes spin': {
                                        '0%': { transform: 'rotate(0deg)' },
                                        '100%': { transform: 'rotate(360deg)' },
                                    },
                                }}
                            >
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
                        <Button variant="contained" onClick={applyFilters}>
                            {t('Appliquer')}
                        </Button>
                    </Box>
                </Paper>
            </Box>

            {/* Low stock alerts */}
            {lowStockAlerts?.length > 0 && (
                <Alert 
                    severity="warning" 
                    sx={{ mb: 3 }}
                    action={
                        <Button color="inherit" size="small" href={route('replenishment.index')}>
                            {t('Voir suggestions')}
                        </Button>
                    }
                >
                    <AlertTitle>{t('Alertes stock bas')}</AlertTitle>
                    {lowStockAlerts.length} {t('produits nécessitent un réapprovisionnement')}
                </Alert>
            )}

            {/* KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title={t('Valeur totale du stock')}
                        value={formatCurrency(valuation?.summary?.total_cost_value)}
                        icon={<StockIcon sx={{ fontSize: 28 }} />}
                        color="primary"
                        subtitle={`${formatNumber(valuation?.summary?.total_units)} ${t('articles')}`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title={t('Valeur au prix de vente')}
                        value={formatCurrency(valuation?.summary?.total_retail_value)}
                        icon={<TurnoverIcon sx={{ fontSize: 28 }} />}
                        color="success"
                        subtitle={`${t('Marge potentielle')}: ${formatCurrency(valuation?.summary?.potential_margin)}`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title={t('Produits en rupture')}
                        value={formatNumber(lowStockAlerts?.filter(a => a.quantity <= 0).length || 0)}
                        icon={<AlertIcon sx={{ fontSize: 28 }} />}
                        color="error"
                        subtitle={`${lowStockAlerts?.length || 0} ${t('en stock bas')}`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title={t('Stock dormant')}
                        value={formatNumber(deadStock?.length || 0)}
                        icon={<DeadStockIcon sx={{ fontSize: 28 }} />}
                        color="warning"
                        subtitle={t('+90 jours sans mouvement')}
                    />
                </Grid>
            </Grid>

            {/* Main Content */}
            <Grid container spacing={3}>
                {/* Valuation History Chart */}
                <Grid item xs={12} lg={8}>
                    <Card>
                        <CardHeader
                            title={t('Évolution de la valeur du stock')}
                            subheader={t('Historique des 90 derniers jours')}
                        />
                        <CardContent>
                            <LineChart
                                data={valuationHistory || []}
                                series={[
                                    { key: 'cost_value', color: theme.palette.primary.main, label: t('Valeur coût') },
                                    { key: 'retail_value', color: theme.palette.success.main, label: t('Valeur vente') },
                                ]}
                                height={350}
                                xAxisKey="date"
                                formatValue={(v) => formatCurrency(v)}
                                formatLabel={(d) => d?.substring(5) || ''}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Stock by Category */}
                <Grid item xs={12} lg={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardHeader
                            title={t('Valeur par catégorie')}
                            avatar={<CategoryIcon color="primary" />}
                        />
                        <CardContent>
                            <PieChart
                                data={valuation?.by_category?.map(cat => ({
                                    label: cat.category_name,
                                    value: cat.cost_value,
                                })) || []}
                                donut
                                height={280}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Inventory Turnover */}
                <Grid item xs={12} lg={6}>
                    <Card>
                        <CardHeader
                            title={t('Rotation des stocks')}
                            subheader={t('Ratio de rotation sur la période')}
                        />
                        <CardContent>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>{t('Produit')}</TableCell>
                                            <TableCell align="center">{t('Vendu')}</TableCell>
                                            <TableCell align="center">{t('Stock moyen')}</TableCell>
                                            <TableCell align="center">{t('Rotation')}</TableCell>
                                            <TableCell align="right">{t('Status')}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {turnover?.slice(0, 10).map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                        {item.name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">{formatNumber(item.sold_qty)}</TableCell>
                                                <TableCell align="center">{formatNumber(item.current_stock)}</TableCell>
                                                <TableCell align="center">
                                                    <Typography fontWeight={600}>
                                                        {item.turnover_ratio?.toFixed(1)}x
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label={getTurnoverLabel(item.turnover_ratio)}
                                                        color={getTurnoverColor(item.turnover_ratio)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Dead Stock */}
                <Grid item xs={12} lg={6}>
                    <Card>
                        <CardHeader
                            title={t('Stock dormant')}
                            subheader={t('Aucun mouvement depuis +90 jours')}
                        />
                        <CardContent>
                            {deadStock?.length > 0 ? (
                                <TableContainer sx={{ maxHeight: 400 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>{t('Produit')}</TableCell>
                                                <TableCell align="center">{t('Stock')}</TableCell>
                                                <TableCell align="center">{t('Jours')}</TableCell>
                                                <TableCell align="right">{t('Valeur bloquée')}</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {deadStock.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                            {item.name}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">{formatNumber(item.quantity)}</TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={item.last_activity || '90+j'}
                                                            color="error"
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography color="error.main" fontWeight={600}>
                                                            {formatCurrency(item.value)}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <EmptyState
                                    icon={DeadStockIcon}
                                    title={t('Aucun stock dormant')}
                                    description={t('Tous vos produits ont eu des mouvements récents')}
                                />
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Stock Movements */}
                <Grid item xs={12}>
                    <Card>
                        <CardHeader
                            title={t('Mouvements de stock')}
                            subheader={t('Entrées et sorties sur la période')}
                        />
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            textAlign: 'center',
                                            bgcolor: alpha(theme.palette.success.main, 0.1),
                                            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                                        }}
                                    >
                                        <ArrowUpward sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                                        <Typography variant="h4" fontWeight={600} color="success.main">
                                            {formatNumber(movements?.total_in || 0)}
                                        </Typography>
                                        <Typography color="text.secondary">{t('Entrées')}</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            textAlign: 'center',
                                            bgcolor: alpha(theme.palette.error.main, 0.1),
                                            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                                        }}
                                    >
                                        <ArrowDownward sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                                        <Typography variant="h4" fontWeight={600} color="error.main">
                                            {formatNumber(movements?.total_out || 0)}
                                        </Typography>
                                        <Typography color="text.secondary">{t('Sorties')}</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            textAlign: 'center',
                                            bgcolor: alpha(theme.palette.info.main, 0.1),
                                            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                                        }}
                                    >
                                        <StockIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                                        <Typography variant="h4" fontWeight={600} color="info.main">
                                            {formatNumber((movements?.total_in || 0) - (movements?.total_out || 0))}
                                        </Typography>
                                        <Typography color="text.secondary">{t('Variation nette')}</Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {movements?.by_type && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="subtitle2" gutterBottom>{t('Par type de mouvement')}</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {Object.entries(movements.by_type).map(([type, count]) => (
                                            <Chip
                                                key={type}
                                                label={`${type}: ${formatNumber(count)}`}
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Layout>
    );
}
