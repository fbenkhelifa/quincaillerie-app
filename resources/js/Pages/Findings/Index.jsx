import { useContext, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../../app';
import { StatCard, PageHeader, EmptyState, PieChart } from '@/Components/ui';
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
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    Checkbox,
    TablePagination,
    Collapse,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Warning as AlertIcon,
    Error as CriticalIcon,
    Info as InfoIcon,
    CheckCircle as ResolvedIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Visibility as ViewIcon,
    Check as ApproveIcon,
    Close as DismissIcon,
    PlayArrow as InvestigateIcon,
    ExpandMore as ExpandIcon,
    ExpandLess as CollapseIcon,
    FilterList as FilterIcon,
    Receipt as BillIcon,
    Inventory as ProductIcon,
    AttachMoney as MoneyIcon,
    Timeline as TrendIcon,
    RemoveCircle as CancelIcon,
    TrendingDown as LossIcon,
} from '@mui/icons-material';

// Type icons mapping
const TYPE_ICONS = {
    repeated_cancellation: CancelIcon,
    negative_stock: LossIcon,
    large_adjustment: TrendIcon,
    high_discount: MoneyIcon,
    unusual_void: CancelIcon,
    price_override: MoneyIcon,
    dead_stock: ProductIcon,
    stock_discrepancy: ProductIcon,
};

// Severity colors
const SEVERITY_COLORS = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'default',
};

const SEVERITY_LABELS = {
    critical: 'Critique',
    high: 'Haute',
    medium: 'Moyenne',
    low: 'Basse',
};

const STATUS_COLORS = {
    new: 'error',
    investigating: 'warning',
    resolved: 'success',
    dismissed: 'default',
};

const STATUS_LABELS = {
    new: 'Nouveau',
    investigating: 'En cours',
    resolved: 'Résolu',
    dismissed: 'Ignoré',
};

export default function Index({
    findings,
    stats,
    byType,
    types,
    filters: initialFilters,
}) {
    const { t, locale } = useContext(AppContext);
    const theme = useTheme();
    const [filters, setFilters] = useState(initialFilters || {});
    const [selected, setSelected] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);
    const [statusDialog, setStatusDialog] = useState({ open: false, finding: null });
    const [bulkAction, setBulkAction] = useState('');
    const [notes, setNotes] = useState('');

    const formatCurrency = (value) => {
        return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
            style: 'decimal',
            minimumFractionDigits: 2,
        }).format(value || 0) + ' DA';
    };

    const applyFilters = () => {
        router.get(route('findings.index'), filters, { preserveState: true });
    };

    const clearFilters = () => {
        setFilters({});
        router.get(route('findings.index'));
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    const refreshData = () => {
        router.post(route('analytics.refresh'), { type: 'anomalies' });
    };

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelected(findings.data.map(f => f.id));
        } else {
            setSelected([]);
        }
    };

    const toggleSelect = (id) => {
        setSelected(prev => 
            prev.includes(id) 
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    const openStatusDialog = (finding) => {
        setStatusDialog({ open: true, finding });
        setNotes('');
    };

    const updateStatus = (status) => {
        router.patch(route('findings.update-status', statusDialog.finding.id), {
            status,
            resolution_notes: notes,
        }, {
            onSuccess: () => setStatusDialog({ open: false, finding: null }),
        });
    };

    const handleBulkAction = () => {
        if (!bulkAction || selected.length === 0) return;
        router.post(route('findings.bulk-update'), {
            ids: selected,
            action: bulkAction,
            notes,
        }, {
            onSuccess: () => {
                setSelected([]);
                setBulkAction('');
                setNotes('');
            },
        });
    };

    const getTypeIcon = (type) => {
        const Icon = TYPE_ICONS[type] || AlertIcon;
        return <Icon />;
    };

    const getTypeLabel = (type) => {
        const labels = {
            repeated_cancellation: 'Annulations répétées',
            negative_stock: 'Stock négatif',
            large_adjustment: 'Ajustement important',
            high_discount: 'Remise élevée',
            unusual_void: 'Annulation inhabituelle',
            price_override: 'Modification de prix',
            dead_stock: 'Stock dormant',
            stock_discrepancy: 'Écart de stock',
        };
        return t(labels[type] || type);
    };

    // Prepare pie chart data for by-severity breakdown
    const severityData = [
        { label: t('Critique'), value: stats.critical || 0, color: theme.palette.error.main },
        { label: t('Haute'), value: stats.high || 0, color: theme.palette.warning.main },
        { label: t('Moyenne'), value: stats.by_severity?.medium || 0, color: theme.palette.info.main },
        { label: t('Basse'), value: stats.by_severity?.low || 0, color: theme.palette.grey[500] },
    ].filter(d => d.value > 0);

    return (
        <Layout
            title={t('Anomalies détectées')}
            breadcrumbs={[
                { label: t('Risk Management') },
                { label: t('Anomalies') },
            ]}
        >
            <Head title={t('Anomalies détectées')} />

            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={600} gutterBottom>
                            {t('Détection d\'anomalies')}
                        </Typography>
                        <Typography color="text.secondary">
                            {t('Surveillance automatique des activités suspectes')}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={t('Relancer la détection')}>
                            <IconButton onClick={refreshData} color="primary">
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>

            {/* KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title={t('Anomalies non résolues')}
                        value={stats.new + stats.investigating}
                        icon={<AlertIcon sx={{ fontSize: 28 }} />}
                        color="warning"
                        subtitle={`${stats.new} ${t('nouvelles')}`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title={t('Critiques')}
                        value={stats.critical}
                        icon={<CriticalIcon sx={{ fontSize: 28 }} />}
                        color="error"
                        subtitle={t('Nécessitent attention immédiate')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title={t('En investigation')}
                        value={stats.investigating}
                        icon={<InvestigateIcon sx={{ fontSize: 28 }} />}
                        color="info"
                        subtitle={t('En cours de vérification')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title={t('Impact financier')}
                        value={formatCurrency(stats.total_impact)}
                        icon={<MoneyIcon sx={{ fontSize: 28 }} />}
                        color="primary"
                        subtitle={t('Valeur des anomalies')}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Filters & Table */}
                <Grid item xs={12} lg={8}>
                    {/* Filter bar */}
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <TextField
                                placeholder={t('Rechercher...')}
                                value={filters.search || ''}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                onKeyDown={handleSearch}
                                size="small"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ minWidth: 200 }}
                            />
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>{t('Type')}</InputLabel>
                                <Select
                                    value={filters.type || ''}
                                    label={t('Type')}
                                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                >
                                    <MenuItem value="">{t('Tous')}</MenuItem>
                                    {Object.keys(byType || {}).map(type => (
                                        <MenuItem key={type} value={type}>
                                            {getTypeLabel(type)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>{t('Sévérité')}</InputLabel>
                                <Select
                                    value={filters.severity || ''}
                                    label={t('Sévérité')}
                                    onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                                >
                                    <MenuItem value="">{t('Toutes')}</MenuItem>
                                    <MenuItem value="critical">{t('Critique')}</MenuItem>
                                    <MenuItem value="high">{t('Haute')}</MenuItem>
                                    <MenuItem value="medium">{t('Moyenne')}</MenuItem>
                                    <MenuItem value="low">{t('Basse')}</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 130 }}>
                                <InputLabel>{t('Statut')}</InputLabel>
                                <Select
                                    value={filters.status || ''}
                                    label={t('Statut')}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                >
                                    <MenuItem value="">{t('Tous')}</MenuItem>
                                    <MenuItem value="new">{t('Nouveau')}</MenuItem>
                                    <MenuItem value="investigating">{t('En cours')}</MenuItem>
                                    <MenuItem value="unresolved">{t('Non résolu')}</MenuItem>
                                    <MenuItem value="resolved">{t('Résolu')}</MenuItem>
                                    <MenuItem value="dismissed">{t('Ignoré')}</MenuItem>
                                </Select>
                            </FormControl>
                            <Button variant="contained" onClick={applyFilters} size="small">
                                {t('Filtrer')}
                            </Button>
                            <Button variant="text" onClick={clearFilters} size="small">
                                {t('Réinitialiser')}
                            </Button>
                        </Box>
                    </Paper>

                    {/* Bulk actions */}
                    {selected.length > 0 && (
                        <Paper sx={{ p: 2, mb: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Typography>
                                    {selected.length} {t('sélectionnées')}
                                </Typography>
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>{t('Action')}</InputLabel>
                                    <Select
                                        value={bulkAction}
                                        label={t('Action')}
                                        onChange={(e) => setBulkAction(e.target.value)}
                                    >
                                        <MenuItem value="investigate">{t('Marquer en investigation')}</MenuItem>
                                        <MenuItem value="resolve">{t('Résoudre')}</MenuItem>
                                        <MenuItem value="dismiss">{t('Ignorer')}</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleBulkAction}
                                    disabled={!bulkAction}
                                >
                                    {t('Appliquer')}
                                </Button>
                            </Box>
                        </Paper>
                    )}

                    {/* Findings table */}
                    <Card>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={selected.length > 0 && selected.length < findings.data.length}
                                                checked={selected.length === findings.data.length && findings.data.length > 0}
                                                onChange={toggleSelectAll}
                                            />
                                        </TableCell>
                                        <TableCell>{t('Anomalie')}</TableCell>
                                        <TableCell align="center">{t('Sévérité')}</TableCell>
                                        <TableCell align="center">{t('Statut')}</TableCell>
                                        <TableCell align="right">{t('Impact')}</TableCell>
                                        <TableCell align="right">{t('Actions')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {findings.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6}>
                                                <EmptyState
                                                    icon={<ResolvedIcon />}
                                                    title={t('Aucune anomalie')}
                                                    description={t('Aucune anomalie détectée avec ces filtres')}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        findings.data.map((finding) => (
                                            <>
                                                <TableRow
                                                    key={finding.id}
                                                    hover
                                                    sx={{
                                                        bgcolor: finding.severity === 'critical' 
                                                            ? alpha(theme.palette.error.main, 0.05) 
                                                            : undefined,
                                                    }}
                                                >
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            checked={selected.includes(finding.id)}
                                                            onChange={() => toggleSelect(finding.id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                            <Box
                                                                sx={{
                                                                    p: 1,
                                                                    borderRadius: 1,
                                                                    bgcolor: alpha(theme.palette[SEVERITY_COLORS[finding.severity]]?.main || theme.palette.grey[500], 0.1),
                                                                    color: `${SEVERITY_COLORS[finding.severity]}.main`,
                                                                }}
                                                            >
                                                                {getTypeIcon(finding.type)}
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="body2" fontWeight={600}>
                                                                    {finding.title}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {getTypeLabel(finding.type)} • {new Date(finding.detected_at).toLocaleDateString()}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={t(SEVERITY_LABELS[finding.severity])}
                                                            color={SEVERITY_COLORS[finding.severity]}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={t(STATUS_LABELS[finding.status])}
                                                            color={STATUS_COLORS[finding.status]}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {finding.impact_value ? (
                                                            <Typography fontWeight={600} color="error.main">
                                                                {formatCurrency(finding.impact_value)}
                                                            </Typography>
                                                        ) : '-'}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                            <Tooltip title={t('Détails')}>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => setExpandedRow(expandedRow === finding.id ? null : finding.id)}
                                                                >
                                                                    {expandedRow === finding.id ? <CollapseIcon /> : <ExpandIcon />}
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title={t('Changer statut')}>
                                                                <IconButton
                                                                    size="small"
                                                                    color="primary"
                                                                    onClick={() => openStatusDialog(finding)}
                                                                >
                                                                    <ViewIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell colSpan={6} sx={{ py: 0, borderBottom: expandedRow === finding.id ? undefined : 'none' }}>
                                                        <Collapse in={expandedRow === finding.id}>
                                                            <Box sx={{ py: 2, px: 3 }}>
                                                                <Typography variant="subtitle2" gutterBottom>
                                                                    {t('Explication')}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" paragraph>
                                                                    {finding.explanation}
                                                                </Typography>
                                                                {finding.metadata && Object.keys(finding.metadata).length > 0 && (
                                                                    <>
                                                                        <Typography variant="subtitle2" gutterBottom>
                                                                            {t('Détails')}
                                                                        </Typography>
                                                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                                            {Object.entries(finding.metadata).map(([key, value]) => (
                                                                                <Chip
                                                                                    key={key}
                                                                                    label={`${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`}
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                />
                                                                            ))}
                                                                        </Box>
                                                                    </>
                                                                )}
                                                                {finding.resolution_notes && (
                                                                    <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 1 }}>
                                                                        <Typography variant="subtitle2">{t('Notes de résolution')}</Typography>
                                                                        <Typography variant="body2">{finding.resolution_notes}</Typography>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </Collapse>
                                                    </TableCell>
                                                </TableRow>
                                            </>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {findings.last_page > 1 && (
                            <TablePagination
                                component="div"
                                count={findings.total}
                                page={findings.current_page - 1}
                                onPageChange={(_, page) => router.get(route('findings.index'), { ...filters, page: page + 1 })}
                                rowsPerPage={findings.per_page}
                                onRowsPerPageChange={(e) => router.get(route('findings.index'), { ...filters, per_page: e.target.value })}
                                labelRowsPerPage={t('Par page')}
                            />
                        )}
                    </Card>
                </Grid>

                {/* Sidebar */}
                <Grid item xs={12} lg={4}>
                    {/* Severity breakdown */}
                    <Card sx={{ mb: 3 }}>
                        <CardHeader title={t('Par sévérité')} />
                        <CardContent>
                            <PieChart
                                data={severityData}
                                donut
                                height={200}
                            />
                        </CardContent>
                    </Card>

                    {/* By type */}
                    <Card>
                        <CardHeader title={t('Par type d\'anomalie')} />
                        <CardContent>
                            <List dense>
                                {Object.entries(byType || {}).map(([type, count]) => (
                                    <ListItem
                                        key={type}
                                        secondaryAction={
                                            <Chip label={count} size="small" color="primary" />
                                        }
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            setFilters({ ...filters, type });
                                            applyFilters();
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            {getTypeIcon(type)}
                                        </ListItemIcon>
                                        <ListItemText primary={getTypeLabel(type)} />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Status change dialog */}
            <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, finding: null })} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {t('Modifier le statut')}
                </DialogTitle>
                <DialogContent>
                    {statusDialog.finding && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2">{statusDialog.finding.title}</Typography>
                            <Typography variant="body2" color="text.secondary">{statusDialog.finding.explanation}</Typography>
                        </Box>
                    )}
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label={t('Notes (optionnel)')}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setStatusDialog({ open: false, finding: null })}>
                        {t('Annuler')}
                    </Button>
                    <Button
                        variant="outlined"
                        color="info"
                        startIcon={<InvestigateIcon />}
                        onClick={() => updateStatus('investigating')}
                    >
                        {t('Investiguer')}
                    </Button>
                    <Button
                        variant="outlined"
                        color="default"
                        startIcon={<DismissIcon />}
                        onClick={() => updateStatus('dismissed')}
                    >
                        {t('Ignorer')}
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<ApproveIcon />}
                        onClick={() => updateStatus('resolved')}
                    >
                        {t('Résoudre')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}
