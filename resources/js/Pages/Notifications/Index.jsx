import { useContext, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../../app';
import { StatCard, PageHeader, EmptyState } from '@/Components/ui';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    TablePagination,
    Badge,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    NotificationsActive as UnreadIcon,
    NotificationsOff as ReadIcon,
    Inventory as StockIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    CheckCircle as SuccessIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Visibility as ViewIcon,
    MarkEmailRead as MarkReadIcon,
    MarkEmailUnread as MarkUnreadIcon,
    Delete as DeleteIcon,
    DoneAll as MarkAllReadIcon,
    FilterList as FilterIcon,
    Schedule as ScheduleIcon,
    BugReport as AnomalyIcon,
    ShoppingCart as ReorderIcon,
    PriorityHigh as CriticalIcon,
} from '@mui/icons-material';

// Type icons mapping
const TYPE_ICONS = {
    low_stock: StockIcon,
    anomaly_detected: AnomalyIcon,
    job_failed: ErrorIcon,
    system_alert: NotificationsIcon,
    reorder_suggestion: ReorderIcon,
    stock_critical: CriticalIcon,
};

// Type labels
const TYPE_LABELS = {
    low_stock: 'Stock bas',
    anomaly_detected: 'Anomalie détectée',
    job_failed: 'Échec de tâche',
    system_alert: 'Alerte système',
    reorder_suggestion: 'Suggestion réappro.',
    stock_critical: 'Stock critique',
};

// Severity icons
const SEVERITY_ICONS = {
    info: InfoIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    success: SuccessIcon,
};

const SEVERITY_LABELS = {
    info: 'Info',
    warning: 'Attention',
    error: 'Erreur',
    success: 'Succès',
};

export default function NotificationsIndex({ notifications, stats, types, severities, filters }) {
    const { t } = useContext(AppContext);
    const theme = useTheme();
    const [search, setSearch] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [selectedSeverity, setSelectedSeverity] = useState(filters.severity || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    const handleFilter = () => {
        router.get('/notifications', {
            search: search || undefined,
            type: selectedType || undefined,
            severity: selectedSeverity || undefined,
            status: selectedStatus || undefined,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setSelectedType('');
        setSelectedSeverity('');
        setSelectedStatus('');
        router.get('/notifications');
    };

    const handleMarkAsRead = (id) => {
        router.post(`/notifications/${id}/read`, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleMarkAsUnread = (id) => {
        router.post(`/notifications/${id}/unread`, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleMarkAllAsRead = () => {
        router.post('/notifications/mark-all-read', {}, {
            preserveState: true,
        });
    };

    const handleDelete = (id) => {
        if (confirm(t('Supprimer cette notification ?'))) {
            router.delete(`/notifications/${id}`, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handlePageChange = (event, newPage) => {
        router.get(notifications.path, {
            ...filters,
            page: newPage + 1,
        }, { preserveState: true });
    };

    const getTypeIcon = (type) => {
        const Icon = TYPE_ICONS[type] || NotificationsIcon;
        return Icon;
    };

    const getSeverityIcon = (severity) => {
        const Icon = SEVERITY_ICONS[severity] || InfoIcon;
        return Icon;
    };

    const getSeverityColor = (severity) => {
        return {
            info: 'info',
            warning: 'warning',
            error: 'error',
            success: 'success',
        }[severity] || 'default';
    };

    return (
        <Layout>
            <Head title={t('Notifications')} />

            <Box sx={{ p: 3 }}>
                <PageHeader
                    title={t('Notifications')}
                    subtitle={t('Centre de notifications et alertes système')}
                    icon={<NotificationsIcon />}
                    actions={
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<MarkAllReadIcon />}
                                onClick={handleMarkAllAsRead}
                                disabled={stats.unread === 0}
                            >
                                {t('Tout marquer lu')}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={() => router.reload()}
                            >
                                {t('Actualiser')}
                            </Button>
                        </Box>
                    }
                />

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title={t('Total')}
                            value={stats.total}
                            icon={<NotificationsIcon />}
                            color="primary"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title={t('Non lues')}
                            value={stats.unread}
                            icon={<UnreadIcon />}
                            color="warning"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title={t("Aujourd'hui")}
                            value={stats.today}
                            icon={<ScheduleIcon />}
                            color="info"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title={t('Critiques')}
                            value={stats.by_severity?.error || 0}
                            icon={<ErrorIcon />}
                            color="error"
                        />
                    </Grid>
                </Grid>

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label={t('Rechercher')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>{t('Statut')}</InputLabel>
                                <Select
                                    value={selectedStatus}
                                    label={t('Statut')}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                >
                                    <MenuItem value="">{t('Tous')}</MenuItem>
                                    <MenuItem value="unread">{t('Non lues')}</MenuItem>
                                    <MenuItem value="read">{t('Lues')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>{t('Type')}</InputLabel>
                                <Select
                                    value={selectedType}
                                    label={t('Type')}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                >
                                    <MenuItem value="">{t('Tous')}</MenuItem>
                                    {types.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {TYPE_LABELS[type] || type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>{t('Sévérité')}</InputLabel>
                                <Select
                                    value={selectedSeverity}
                                    label={t('Sévérité')}
                                    onChange={(e) => setSelectedSeverity(e.target.value)}
                                >
                                    <MenuItem value="">{t('Toutes')}</MenuItem>
                                    {severities.map((severity) => (
                                        <MenuItem key={severity} value={severity}>
                                            {SEVERITY_LABELS[severity] || severity}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12} md={3}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<FilterIcon />}
                                    onClick={handleFilter}
                                >
                                    {t('Filtrer')}
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={handleReset}
                                >
                                    {t('Réinitialiser')}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Notifications Table */}
                <Paper>
                    {notifications.data.length === 0 ? (
                        <EmptyState
                            icon={<NotificationsIcon sx={{ fontSize: 64, opacity: 0.5 }} />}
                            title={t('Aucune notification')}
                            description={t('Aucune notification ne correspond à vos critères.')}
                        />
                    ) : (
                        <>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell width={60}></TableCell>
                                            <TableCell>{t('Notification')}</TableCell>
                                            <TableCell width={120}>{t('Type')}</TableCell>
                                            <TableCell width={100}>{t('Sévérité')}</TableCell>
                                            <TableCell width={150}>{t('Date')}</TableCell>
                                            <TableCell width={120} align="right">{t('Actions')}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {notifications.data.map((notification) => {
                                            const TypeIcon = getTypeIcon(notification.type);
                                            const isUnread = !notification.read_at;

                                            return (
                                                <TableRow
                                                    key={notification.id}
                                                    sx={{
                                                        bgcolor: isUnread
                                                            ? alpha(theme.palette.primary.main, 0.05)
                                                            : 'inherit',
                                                        '&:hover': {
                                                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                        },
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Badge
                                                            color={getSeverityColor(notification.severity)}
                                                            variant="dot"
                                                            invisible={!isUnread}
                                                        >
                                                            <TypeIcon
                                                                color={getSeverityColor(notification.severity)}
                                                            />
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={isUnread ? 600 : 400}
                                                        >
                                                            {notification.title}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            sx={{
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden',
                                                            }}
                                                        >
                                                            {notification.message}
                                                        </Typography>
                                                        {notification.action_url && (
                                                            <Button
                                                                size="small"
                                                                sx={{ mt: 0.5, p: 0, minWidth: 0 }}
                                                                onClick={() => router.visit(notification.action_url)}
                                                            >
                                                                {notification.action_label || t('Voir détails')}
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={TYPE_LABELS[notification.type] || notification.type}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={SEVERITY_LABELS[notification.severity] || notification.severity}
                                                            size="small"
                                                            color={getSeverityColor(notification.severity)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title={isUnread ? t('Marquer comme lu') : t('Marquer comme non lu')}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => isUnread
                                                                    ? handleMarkAsRead(notification.id)
                                                                    : handleMarkAsUnread(notification.id)
                                                                }
                                                            >
                                                                {isUnread ? <MarkReadIcon /> : <MarkUnreadIcon />}
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title={t('Supprimer')}>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleDelete(notification.id)}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                component="div"
                                count={notifications.total}
                                page={notifications.current_page - 1}
                                onPageChange={handlePageChange}
                                rowsPerPage={notifications.per_page}
                                rowsPerPageOptions={[20]}
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from}-${to} ${t('sur')} ${count}`
                                }
                            />
                        </>
                    )}
                </Paper>
            </Box>
        </Layout>
    );
}
