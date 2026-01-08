import { useContext, useState, useMemo, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../../app';
import { FilterBar, EmptyState } from '@/Components/ui';
import {
    Box,
    Button,
    Paper,
    Typography,
    Chip,
    Grid,
    Card,
    CardContent,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    LinearProgress,
    Skeleton,
    alpha,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Refresh as RefreshIcon,
    ShoppingCart as CartIcon,
    TrendingUp as TrendingIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    Close as CloseIcon,
    BarChart as ChartIcon,
    CheckCircle as CheckIcon,
    Cancel as DismissIcon,
    LocalShipping as SupplierIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

// Simple line chart component for forecast visualization
function ForecastChart({ data, currentStock, reorderPoint, safetyStock }) {
    if (!data || !data.historical || !data.forecast) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">Données insuffisantes pour le graphique</Typography>
            </Box>
        );
    }

    const historical = data.historical || [];
    const forecast = data.forecast || [];
    const all = [...historical, ...forecast];
    
    const maxValue = Math.max(
        ...all.map(d => d.value || d.quantity || 0),
        currentStock || 0,
        reorderPoint || 0
    );
    
    const chartHeight = 200;
    const chartWidth = 600;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    
    const xScale = (index) => padding.left + (index / (all.length - 1 || 1)) * (chartWidth - padding.left - padding.right);
    const yScale = (value) => chartHeight - padding.bottom - ((value / (maxValue || 1)) * (chartHeight - padding.top - padding.bottom));

    // Generate path for line
    const generatePath = (points, key = 'value') => {
        if (points.length === 0) return '';
        return points.map((p, i) => {
            const x = xScale(key === 'forecast' ? historical.length + i : i);
            const y = yScale(p.value || p.quantity || 0);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    };

    return (
        <Box sx={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
            <svg width={chartWidth} height={chartHeight}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
                    <g key={tick}>
                        <line
                            x1={padding.left}
                            y1={yScale(tick * maxValue)}
                            x2={chartWidth - padding.right}
                            y2={yScale(tick * maxValue)}
                            stroke="#e0e0e0"
                            strokeDasharray="4,4"
                        />
                        <text
                            x={padding.left - 10}
                            y={yScale(tick * maxValue)}
                            textAnchor="end"
                            alignmentBaseline="middle"
                            fontSize={10}
                            fill="#666"
                        >
                            {Math.round(tick * maxValue)}
                        </text>
                    </g>
                ))}

                {/* Reorder point line */}
                {reorderPoint > 0 && (
                    <g>
                        <line
                            x1={padding.left}
                            y1={yScale(reorderPoint)}
                            x2={chartWidth - padding.right}
                            y2={yScale(reorderPoint)}
                            stroke="#ff9800"
                            strokeWidth={2}
                            strokeDasharray="6,3"
                        />
                        <text
                            x={chartWidth - padding.right + 5}
                            y={yScale(reorderPoint)}
                            fontSize={10}
                            fill="#ff9800"
                            alignmentBaseline="middle"
                        >
                            ROP
                        </text>
                    </g>
                )}

                {/* Safety stock line */}
                {safetyStock > 0 && (
                    <g>
                        <line
                            x1={padding.left}
                            y1={yScale(safetyStock)}
                            x2={chartWidth - padding.right}
                            y2={yScale(safetyStock)}
                            stroke="#f44336"
                            strokeWidth={2}
                            strokeDasharray="3,3"
                        />
                        <text
                            x={chartWidth - padding.right + 5}
                            y={yScale(safetyStock)}
                            fontSize={10}
                            fill="#f44336"
                            alignmentBaseline="middle"
                        >
                            SS
                        </text>
                    </g>
                )}

                {/* Current stock line */}
                {currentStock > 0 && (
                    <line
                        x1={padding.left}
                        y1={yScale(currentStock)}
                        x2={chartWidth - padding.right}
                        y2={yScale(currentStock)}
                        stroke="#4caf50"
                        strokeWidth={1}
                        strokeDasharray="2,2"
                    />
                )}

                {/* Historical line */}
                {historical.length > 0 && (
                    <path
                        d={generatePath(historical)}
                        fill="none"
                        stroke="#1976d2"
                        strokeWidth={2}
                    />
                )}

                {/* Forecast line (dashed) */}
                {forecast.length > 0 && (
                    <path
                        d={generatePath(forecast, 'forecast')}
                        fill="none"
                        stroke="#9c27b0"
                        strokeWidth={2}
                        strokeDasharray="5,5"
                    />
                )}

                {/* X-axis labels */}
                <text x={padding.left} y={chartHeight - 10} fontSize={10} fill="#666">
                    {historical[0]?.date || 'Historique'}
                </text>
                <text x={chartWidth - padding.right} y={chartHeight - 10} fontSize={10} fill="#666" textAnchor="end">
                    {forecast[forecast.length - 1]?.date || 'Prévision'}
                </text>
            </svg>

            {/* Legend */}
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 20, height: 3, bgcolor: '#1976d2' }} />
                    <Typography variant="caption">Historique</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 20, height: 3, bgcolor: '#9c27b0', borderStyle: 'dashed', borderWidth: 1, borderColor: '#9c27b0', height: 0 }} />
                    <Typography variant="caption">Prévision</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 20, height: 3, bgcolor: '#ff9800' }} />
                    <Typography variant="caption">Point de commande</Typography>
                </Box>
            </Box>
        </Box>
    );
}

export default function ReplenishmentIndex({ suggestions, suppliers, filters, stats }) {
    const { t, locale } = useContext(AppContext);
    const [selectedIds, setSelectedIds] = useState([]);
    const [detailDialog, setDetailDialog] = useState({ open: false, product: null, loading: false, data: null });
    const [recomputing, setRecomputing] = useState(false);

    const [paginationModel, setPaginationModel] = useState({
        pageSize: suggestions.per_page || 20,
        page: (suggestions.current_page || 1) - 1,
    });

    const filterConfig = useMemo(() => [
        {
            id: 'urgency',
            label: t('Urgence'),
            type: 'select',
            width: 3,
            options: [
                { value: 'critical', label: t('Critique') },
                { value: 'high', label: t('Haute') },
                { value: 'medium', label: t('Moyenne') },
                { value: 'low', label: t('Basse') },
            ],
        },
        {
            id: 'supplier_id',
            label: t('Fournisseur'),
            type: 'select',
            width: 3,
            options: suppliers.map(s => ({ value: s.id, label: s.name })),
        },
        {
            id: 'min_confidence',
            label: t('Confiance min.'),
            type: 'select',
            width: 2,
            options: [
                { value: 50, label: '50%+' },
                { value: 70, label: '70%+' },
                { value: 90, label: '90%+' },
            ],
        },
    ], [t, suppliers]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
            minimumFractionDigits: 2,
        }).format(value) + ' DA';
    };

    const urgencyColors = {
        critical: 'error',
        high: 'warning',
        medium: 'info',
        low: 'default',
    };

    const urgencyLabels = {
        critical: t('Critique'),
        high: t('Haute'),
        medium: t('Moyenne'),
        low: t('Basse'),
    };

    const handlePageChange = (model) => {
        setPaginationModel(model);
        router.get(
            route('replenishment.index'),
            { ...filters, page: model.page + 1 },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleRecompute = () => {
        setRecomputing(true);
        router.post(route('replenishment.recompute'), { sync: true }, {
            onSuccess: () => {
                toast.success(t('Suggestions recalculées'));
                setRecomputing(false);
            },
            onError: () => {
                toast.error(t('Erreur lors du recalcul'));
                setRecomputing(false);
            },
        });
    };

    const handleApprove = () => {
        if (selectedIds.length === 0) {
            toast.error(t('Sélectionnez au moins une suggestion'));
            return;
        }

        router.post(route('replenishment.approve'), { suggestion_ids: selectedIds });
    };

    const handleDismiss = () => {
        if (selectedIds.length === 0) {
            toast.error(t('Sélectionnez au moins une suggestion'));
            return;
        }

        router.post(route('replenishment.dismiss'), { suggestion_ids: selectedIds }, {
            onSuccess: () => {
                toast.success(t('Suggestions ignorées'));
                setSelectedIds([]);
            },
        });
    };

    const openProductDetail = async (productId) => {
        setDetailDialog({ open: true, product: null, loading: true, data: null });

        try {
            const response = await fetch(route('replenishment.product.forecast', productId));
            const data = await response.json();
            setDetailDialog({ open: true, product: data.product, loading: false, data });
        } catch (error) {
            toast.error(t('Erreur lors du chargement'));
            setDetailDialog({ open: false, product: null, loading: false, data: null });
        }
    };

    const columns = useMemo(() => [
        {
            field: 'product',
            headerName: t('Produit'),
            flex: 2,
            minWidth: 200,
            renderCell: (params) => (
                <Box>
                    <Typography variant="body2" fontWeight={500}>
                        {params.row.product?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {params.row.product?.sku}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'current_stock',
            headerName: t('Stock actuel'),
            width: 110,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={params.value <= (params.row.product?.min_stock || 0) ? 'error' : 'default'}
                />
            ),
        },
        {
            field: 'recommended_qty',
            headerName: t('Qté recommandée'),
            width: 130,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Typography fontWeight={600} color="primary">
                    +{params.value}
                </Typography>
            ),
        },
        {
            field: 'days_until_stockout',
            headerName: t('Rupture dans'),
            width: 120,
            align: 'center',
            renderCell: (params) => {
                const days = params.value;
                if (days === null || days === undefined) return '-';
                
                return (
                    <Chip
                        label={days <= 0 ? t('Imminent!') : `${days} ${t('jours')}`}
                        size="small"
                        color={days <= 3 ? 'error' : days <= 7 ? 'warning' : 'default'}
                    />
                );
            },
        },
        {
            field: 'urgency',
            headerName: t('Urgence'),
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={urgencyLabels[params.value] || params.value}
                    color={urgencyColors[params.value] || 'default'}
                    size="small"
                />
            ),
        },
        {
            field: 'confidence',
            headerName: t('Confiance'),
            width: 100,
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LinearProgress
                        variant="determinate"
                        value={params.value || 0}
                        sx={{ width: 40, height: 6, borderRadius: 3 }}
                        color={params.value >= 80 ? 'success' : params.value >= 50 ? 'warning' : 'error'}
                    />
                    <Typography variant="caption">{Math.round(params.value)}%</Typography>
                </Box>
            ),
        },
        {
            field: 'suggested_supplier',
            headerName: t('Fournisseur'),
            width: 140,
            valueGetter: (value, row) => row.suggested_supplier?.name || '-',
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: t('Actions'),
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    key="detail"
                    icon={<ChartIcon />}
                    label={t('Détails')}
                    onClick={() => openProductDetail(params.row.product?.id)}
                />,
                <GridActionsCellItem
                    key="info"
                    icon={<InfoIcon />}
                    label={t('Explication')}
                    onClick={() => {
                        const reasons = params.row.reason_json || {};
                        toast(
                            <Box>
                                <Typography variant="subtitle2">{t('Pourquoi cette recommandation ?')}</Typography>
                                <Typography variant="body2">{reasons.summary || t('Basé sur l\'historique des ventes')}</Typography>
                            </Box>,
                            { duration: 5000 }
                        );
                    }}
                />,
            ],
        },
    ], [t, locale]);

    const rows = suggestions.data || [];

    return (
        <Layout>
            <Head title={t('Assistant Réapprovisionnement')} />

            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            {t('Assistant Réapprovisionnement')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('Recommandations intelligentes basées sur l\'analyse des ventes')}
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleRecompute}
                        disabled={recomputing}
                    >
                        {recomputing ? t('Calcul...') : t('Recalculer')}
                    </Button>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h4" color="primary" fontWeight="bold">
                                    {stats.total_pending || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('Suggestions en attente')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Card sx={{ borderLeft: 4, borderColor: 'error.main' }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h4" color="error" fontWeight="bold">
                                    {stats.critical || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('Critiques')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Card sx={{ borderLeft: 4, borderColor: 'warning.main' }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h4" color="warning.main" fontWeight="bold">
                                    {stats.high_priority || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('Haute priorité')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h4" fontWeight="bold">
                                    {formatCurrency(stats.total_value || 0)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('Valeur totale')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters & Actions */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <FilterBar
                            filters={filterConfig}
                            values={filters}
                            routeName="replenishment.index"
                            showSearch
                            searchPlaceholder={t('Rechercher un produit...')}
                        />

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DismissIcon />}
                                onClick={handleDismiss}
                                disabled={selectedIds.length === 0}
                            >
                                {t('Ignorer')} ({selectedIds.length})
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<CartIcon />}
                                onClick={handleApprove}
                                disabled={selectedIds.length === 0}
                            >
                                {t('Créer commande')} ({selectedIds.length})
                            </Button>
                        </Box>
                    </Box>
                </Paper>

                {/* Data Grid */}
                <Paper sx={{ height: 600 }}>
                    {rows.length === 0 ? (
                        <EmptyState
                            icon={TrendingIcon}
                            title={t('Aucune suggestion')}
                            description={t('Toutes les recommandations ont été traitées ou le système n\'a pas encore analysé vos produits.')}
                            action={
                                <Button variant="contained" startIcon={<RefreshIcon />} onClick={handleRecompute}>
                                    {t('Analyser maintenant')}
                                </Button>
                            }
                        />
                    ) : (
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            paginationModel={paginationModel}
                            onPaginationModelChange={handlePageChange}
                            pageSizeOptions={[10, 20, 50]}
                            rowCount={suggestions.total || 0}
                            paginationMode="server"
                            checkboxSelection
                            rowSelectionModel={selectedIds}
                            onRowSelectionModelChange={setSelectedIds}
                            disableRowSelectionOnClick
                            getRowId={(row) => row.id}
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-row': {
                                    '&:hover': {
                                        bgcolor: alpha('#1976d2', 0.04),
                                    },
                                },
                            }}
                        />
                    )}
                </Paper>
            </Box>

            {/* Product Detail Dialog with Chart */}
            <Dialog
                open={detailDialog.open}
                onClose={() => setDetailDialog({ open: false, product: null, loading: false, data: null })}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6">
                            {detailDialog.product?.name || t('Analyse du produit')}
                        </Typography>
                        {detailDialog.product?.sku && (
                            <Typography variant="caption" color="text.secondary">
                                {detailDialog.product.sku}
                            </Typography>
                        )}
                    </Box>
                    <IconButton onClick={() => setDetailDialog({ open: false, product: null, loading: false, data: null })}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {detailDialog.loading ? (
                        <Box sx={{ p: 4 }}>
                            <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
                            <Skeleton variant="text" width="60%" />
                            <Skeleton variant="text" width="40%" />
                        </Box>
                    ) : detailDialog.data ? (
                        <Box>
                            {/* Key metrics */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={4}>
                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {t('Stock actuel')}
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold">
                                            {detailDialog.product?.current_stock}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={4}>
                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {t('Point de commande')}
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold" color="warning.main">
                                            {detailDialog.data.suggestion?.reorder_point || '-'}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={4}>
                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {t('Stock de sécurité')}
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold" color="error.main">
                                            {detailDialog.data.suggestion?.safety_stock || '-'}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Forecast Chart */}
                            <Typography variant="subtitle2" gutterBottom>
                                {t('Historique des ventes & Prévisions')}
                            </Typography>
                            <Paper sx={{ p: 2, mb: 3 }}>
                                <ForecastChart
                                    data={detailDialog.data.forecast}
                                    currentStock={detailDialog.product?.current_stock}
                                    reorderPoint={detailDialog.data.suggestion?.reorder_point}
                                    safetyStock={detailDialog.data.suggestion?.safety_stock}
                                />
                            </Paper>

                            {/* Explanation */}
                            {detailDialog.data.suggestion?.explanation && (
                                <Paper sx={{ p: 2, bgcolor: 'info.50' }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        <InfoIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 18 }} />
                                        {t('Pourquoi cette recommandation ?')}
                                    </Typography>
                                    <Typography variant="body2">
                                        {detailDialog.data.suggestion.explanation}
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                    ) : (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                            {t('Aucune donnée disponible')}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialog({ open: false, product: null, loading: false, data: null })}>
                        {t('Fermer')}
                    </Button>
                    {detailDialog.data?.suggestion && (
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<CartIcon />}
                            onClick={() => {
                                router.post(route('replenishment.approve'), {
                                    suggestion_ids: [detailDialog.data.suggestion.id],
                                });
                            }}
                        >
                            {t('Commander')} +{detailDialog.data.suggestion.recommended_qty}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Layout>
    );
}
