import { useContext, useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../../app';
import { StatCard, EmptyState, HorizontalBarChart } from '@/Components/ui';
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
    TablePagination,
    Avatar,
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
} from '@mui/material';
import {
    History as HistoryIcon,
    Person as PersonIcon,
    Search as SearchIcon,
    Download as ExportIcon,
    DateRange as DateRangeIcon,
    Add as CreateIcon,
    Edit as UpdateIcon,
    Delete as DeleteIcon,
    Cancel as CancelIcon,
    Tune as AdjustIcon,
    LocalShipping as ReceiveIcon,
    Send as SendIcon,
    Visibility as ViewIcon,
    ExpandMore as ExpandIcon,
    ExpandLess as CollapseIcon,
    Receipt as BillIcon,
    Inventory as ProductIcon,
    ShoppingCart as PurchaseIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';

// Action icons mapping
const ACTION_ICONS = {
    created: CreateIcon,
    updated: UpdateIcon,
    deleted: DeleteIcon,
    cancelled: CancelIcon,
    adjusted: AdjustIcon,
    received: ReceiveIcon,
    sent: SendIcon,
};

// Action colors
const ACTION_COLORS = {
    created: 'success',
    updated: 'info',
    deleted: 'error',
    cancelled: 'error',
    adjusted: 'warning',
    received: 'success',
    sent: 'info',
};

// Entity icons
const ENTITY_ICONS = {
    Bill: BillIcon,
    Product: ProductIcon,
    PurchaseOrder: PurchaseIcon,
    Setting: SettingsIcon,
};

const ACTION_LABELS = {
    created: 'Créé',
    updated: 'Modifié',
    deleted: 'Supprimé',
    cancelled: 'Annulé',
    adjusted: 'Ajusté',
    received: 'Réceptionné',
    sent: 'Envoyé',
};

export default function Index({
    logs,
    users,
    entityTypes,
    actions,
    stats,
    filters: initialFilters,
}) {
    const { t, locale } = useContext(AppContext);
    const theme = useTheme();
    const [filters, setFilters] = useState(initialFilters || {});
    const [detailDialog, setDetailDialog] = useState({ open: false, log: null });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : 'fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const applyFilters = () => {
        router.get(route('audit-log.index'), filters, { preserveState: true });
    };

    const clearFilters = () => {
        setFilters({});
        router.get(route('audit-log.index'));
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    const handleExport = () => {
        window.open(route('audit-log.export', filters));
    };

    const getActionIcon = (action) => {
        const Icon = ACTION_ICONS[action] || HistoryIcon;
        return <Icon />;
    };

    const getEntityIcon = (entityType) => {
        const baseName = entityType?.split('\\').pop() || 'Unknown';
        const Icon = ENTITY_ICONS[baseName] || HistoryIcon;
        return <Icon fontSize="small" />;
    };

    const getEntityName = (entityType) => {
        return entityType?.split('\\').pop() || 'Unknown';
    };

    // Prepare top users chart data
    const topUsersData = Object.entries(stats.top_users || {}).map(([name, count]) => ({
        label: name,
        value: count,
    }));

    return (
        <Layout
            title={t('Journal d\'audit')}
            breadcrumbs={[
                { label: t('Risk Management') },
                { label: t('Audit') },
            ]}
        >
            <Head title={t('Journal d\'audit')} />

            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={600} gutterBottom>
                            {t('Journal d\'audit')}
                        </Typography>
                        <Typography color="text.secondary">
                            {t('Traçabilité complète des actions critiques')}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={t('Exporter')}>
                            <IconButton onClick={handleExport}>
                                <ExportIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>

            {/* KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title={t('Actions aujourd\'hui')}
                        value={stats.total_today}
                        icon={<HistoryIcon sx={{ fontSize: 28 }} />}
                        color="primary"
                        subtitle={t('Dernières 24h')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title={t('Cette semaine')}
                        value={stats.total_week}
                        icon={<DateRangeIcon sx={{ fontSize: 28 }} />}
                        color="info"
                        subtitle={t('7 derniers jours')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title={t('Créations')}
                        value={stats.by_action?.created || 0}
                        icon={<CreateIcon sx={{ fontSize: 28 }} />}
                        color="success"
                        subtitle={t('Nouveaux enregistrements')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title={t('Modifications')}
                        value={(stats.by_action?.updated || 0) + (stats.by_action?.adjusted || 0)}
                        icon={<UpdateIcon sx={{ fontSize: 28 }} />}
                        color="warning"
                        subtitle={t('Mises à jour')}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Main table */}
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
                                sx={{ minWidth: 180 }}
                            />
                            <TextField
                                type="date"
                                label={t('Date début')}
                                value={filters.start_date || ''}
                                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: 150 }}
                            />
                            <TextField
                                type="date"
                                label={t('Date fin')}
                                value={filters.end_date || ''}
                                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: 150 }}
                            />
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>{t('Action')}</InputLabel>
                                <Select
                                    value={filters.action || ''}
                                    label={t('Action')}
                                    onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                                >
                                    <MenuItem value="">{t('Toutes')}</MenuItem>
                                    {Object.entries(ACTION_LABELS).map(([key, label]) => (
                                        <MenuItem key={key} value={key}>{t(label)}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>{t('Utilisateur')}</InputLabel>
                                <Select
                                    value={filters.user_id || ''}
                                    label={t('Utilisateur')}
                                    onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
                                >
                                    <MenuItem value="">{t('Tous')}</MenuItem>
                                    {users?.map(user => (
                                        <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
                                    ))}
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

                    {/* Logs table */}
                    <Card>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('Date')}</TableCell>
                                        <TableCell>{t('Utilisateur')}</TableCell>
                                        <TableCell>{t('Action')}</TableCell>
                                        <TableCell>{t('Entité')}</TableCell>
                                        <TableCell>{t('Description')}</TableCell>
                                        <TableCell align="right">{t('Détails')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {logs.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6}>
                                                <EmptyState
                                                    icon={HistoryIcon}
                                                    title={t('Aucun log')}
                                                    description={t('Aucune action enregistrée avec ces filtres')}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.data.map((log) => (
                                            <TableRow key={log.id} hover>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {formatDate(log.created_at)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                                                            {log.user_name?.charAt(0) || '?'}
                                                        </Avatar>
                                                        <Typography variant="body2">
                                                            {log.user_name || t('Système')}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={getActionIcon(log.action)}
                                                        label={t(ACTION_LABELS[log.action] || log.action)}
                                                        color={ACTION_COLORS[log.action] || 'default'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {getEntityIcon(log.auditable_type)}
                                                        <Typography variant="body2">
                                                            {getEntityName(log.auditable_type)} #{log.auditable_id}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                        {log.event || log.reason || '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Tooltip title={t('Voir les détails')}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setDetailDialog({ open: true, log })}
                                                        >
                                                            <ViewIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {logs.last_page > 1 && (
                            <TablePagination
                                component="div"
                                count={logs.total}
                                page={logs.current_page - 1}
                                onPageChange={(_, page) => router.get(route('audit-log.index'), { ...filters, page: page + 1 })}
                                rowsPerPage={logs.per_page}
                                onRowsPerPageChange={(e) => router.get(route('audit-log.index'), { ...filters, per_page: e.target.value })}
                                labelRowsPerPage={t('Par page')}
                            />
                        )}
                    </Card>
                </Grid>

                {/* Sidebar */}
                <Grid item xs={12} lg={4}>
                    {/* Actions breakdown */}
                    <Card sx={{ mb: 3 }}>
                        <CardHeader title={t('Par type d\'action')} />
                        <CardContent>
                            <List dense>
                                {Object.entries(stats.by_action || {}).map(([action, count]) => (
                                    <ListItem
                                        key={action}
                                        secondaryAction={
                                            <Chip label={count} size="small" color={ACTION_COLORS[action] || 'default'} />
                                        }
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            setFilters({ ...filters, action });
                                            applyFilters();
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ 
                                                width: 32, 
                                                height: 32, 
                                                bgcolor: alpha(theme.palette[ACTION_COLORS[action]]?.main || theme.palette.grey[500], 0.1),
                                                color: `${ACTION_COLORS[action]}.main`
                                            }}>
                                                {getActionIcon(action)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={t(ACTION_LABELS[action] || action)} />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>

                    {/* Top users */}
                    <Card>
                        <CardHeader title={t('Utilisateurs les plus actifs')} subheader={t('Cette semaine')} />
                        <CardContent>
                            {topUsersData.length > 0 ? (
                                <HorizontalBarChart
                                    data={topUsersData}
                                    valueKey="value"
                                    labelKey="label"
                                    height={180}
                                    color={theme.palette.secondary.main}
                                />
                            ) : (
                                <Typography color="text.secondary" textAlign="center">
                                    {t('Aucune donnée')}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Detail dialog */}
            <Dialog 
                open={detailDialog.open} 
                onClose={() => setDetailDialog({ open: false, log: null })} 
                maxWidth="md" 
                fullWidth
            >
                {detailDialog.log && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip
                                    icon={getActionIcon(detailDialog.log.action)}
                                    label={t(ACTION_LABELS[detailDialog.log.action] || detailDialog.log.action)}
                                    color={ACTION_COLORS[detailDialog.log.action] || 'default'}
                                />
                                <Typography>
                                    {getEntityName(detailDialog.log.auditable_type)} #{detailDialog.log.auditable_id}
                                </Typography>
                            </Box>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">{t('Date')}</Typography>
                                    <Typography>{formatDate(detailDialog.log.created_at)}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">{t('Utilisateur')}</Typography>
                                    <Typography>{detailDialog.log.user_name || t('Système')}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">{t('Adresse IP')}</Typography>
                                    <Typography>{detailDialog.log.ip_address || '-'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">{t('Événement')}</Typography>
                                    <Typography>{detailDialog.log.event || '-'}</Typography>
                                </Grid>
                                {detailDialog.log.reason && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">{t('Raison')}</Typography>
                                        <Typography>{detailDialog.log.reason}</Typography>
                                    </Grid>
                                )}

                                {/* Changes */}
                                {(detailDialog.log.old_values || detailDialog.log.new_values) && (
                                    <Grid item xs={12}>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="subtitle1" gutterBottom>{t('Modifications')}</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                                                    <Typography variant="subtitle2" color="error.main" gutterBottom>
                                                        {t('Anciennes valeurs')}
                                                    </Typography>
                                                    <pre style={{ 
                                                        fontSize: 12, 
                                                        margin: 0, 
                                                        overflow: 'auto',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                    }}>
                                                        {JSON.stringify(detailDialog.log.old_values, null, 2) || '-'}
                                                    </pre>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                                                    <Typography variant="subtitle2" color="success.main" gutterBottom>
                                                        {t('Nouvelles valeurs')}
                                                    </Typography>
                                                    <pre style={{ 
                                                        fontSize: 12, 
                                                        margin: 0, 
                                                        overflow: 'auto',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                    }}>
                                                        {JSON.stringify(detailDialog.log.new_values, null, 2) || '-'}
                                                    </pre>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                )}

                                {/* Metadata */}
                                {detailDialog.log.metadata && Object.keys(detailDialog.log.metadata).length > 0 && (
                                    <Grid item xs={12}>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="subtitle1" gutterBottom>{t('Métadonnées')}</Typography>
                                        <Paper sx={{ p: 2, bgcolor: theme.palette.action.hover }}>
                                            <pre style={{ 
                                                fontSize: 12, 
                                                margin: 0, 
                                                overflow: 'auto',
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                            }}>
                                                {JSON.stringify(detailDialog.log.metadata, null, 2)}
                                            </pre>
                                        </Paper>
                                    </Grid>
                                )}
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDetailDialog({ open: false, log: null })}>
                                {t('Fermer')}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Layout>
    );
}
