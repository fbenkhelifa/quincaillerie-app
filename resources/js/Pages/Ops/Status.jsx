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
    CardHeader,
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
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    Alert,
    AlertTitle,
    Collapse,
} from '@mui/material';
import {
    Dashboard as OpsIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Schedule as ScheduleIcon,
    PlayArrow as RunIcon,
    Refresh as RefreshIcon,
    Storage as QueueIcon,
    Timeline as TimelineIcon,
    AccessTime as ClockIcon,
    Pending as PendingIcon,
    Done as CompletedIcon,
    Close as FailedIcon,
    ExpandMore as ExpandIcon,
    ExpandLess as CollapseIcon,
    Inventory as ReorderIcon,
    Analytics as AnalyticsIcon,
    BugReport as AnomalyIcon,
    NotificationsActive as NotificationIcon,
} from '@mui/icons-material';

// Group icons
const GROUP_ICONS = {
    reorder: ReorderIcon,
    analytics: AnalyticsIcon,
    anomaly: AnomalyIcon,
    notification: NotificationIcon,
};

// Status icons
const STATUS_ICONS = {
    pending: PendingIcon,
    running: ScheduleIcon,
    completed: CompletedIcon,
    failed: FailedIcon,
};

// Status colors
const STATUS_COLORS = {
    pending: 'default',
    running: 'info',
    completed: 'success',
    failed: 'error',
};

export default function OpsStatus({ lastRuns, queueHealth, recentRuns, stats, scheduleInfo }) {
    const { t } = useContext(AppContext);
    const theme = useTheme();
    const [showAllRuns, setShowAllRuns] = useState(false);

    const handleTriggerJob = (jobName) => {
        if (confirm(t('Lancer cette tâche maintenant ?'))) {
            router.post(`/ops/trigger/${jobName}`, {}, {
                preserveState: true,
            });
        }
    };

    const getQueueHealthColor = () => {
        switch (queueHealth.status) {
            case 'healthy': return 'success';
            case 'warning': return 'warning';
            case 'critical': return 'error';
            default: return 'default';
        }
    };

    const getQueueHealthIcon = () => {
        switch (queueHealth.status) {
            case 'healthy': return <SuccessIcon color="success" />;
            case 'warning': return <WarningIcon color="warning" />;
            case 'critical': return <ErrorIcon color="error" />;
            default: return <QueueIcon />;
        }
    };

    const displayedRuns = showAllRuns ? recentRuns : recentRuns.slice(0, 10);

    return (
        <Layout>
            <Head title={t('Statut Ops')} />

            <Box sx={{ p: 3 }}>
                <PageHeader
                    title={t('Statut Opérationnel')}
                    subtitle={t('Surveillance des tâches planifiées et de la file d\'attente')}
                    icon={<OpsIcon />}
                    actions={
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={() => router.reload()}
                        >
                            {t('Actualiser')}
                        </Button>
                    }
                />

                {/* Stats Summary */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title={t("Exécutions aujourd'hui")}
                            value={stats.total_runs_today}
                            icon={<ScheduleIcon />}
                            color="primary"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title={t('Réussies')}
                            value={stats.successful_runs_today}
                            icon={<SuccessIcon />}
                            color="success"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title={t('Échouées (7j)')}
                            value={stats.failed_runs_week}
                            icon={<ErrorIcon />}
                            color="error"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title={t('Notifications non lues')}
                            value={stats.unread_notifications}
                            icon={<NotificationIcon />}
                            color="warning"
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    {/* Queue Health */}
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardHeader
                                title={t('Santé de la file d\'attente')}
                                avatar={getQueueHealthIcon()}
                            />
                            <CardContent>
                                <Alert severity={getQueueHealthColor()} sx={{ mb: 2 }}>
                                    <AlertTitle>{queueHealth.status_label}</AlertTitle>
                                    {t('Driver')}: {queueHealth.driver_label}
                                </Alert>

                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Paper
                                            sx={{
                                                p: 2,
                                                textAlign: 'center',
                                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                            }}
                                        >
                                            <Typography variant="h4" color="info.main">
                                                {queueHealth.pending_jobs}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {t('En attente')}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Paper
                                            sx={{
                                                p: 2,
                                                textAlign: 'center',
                                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                            }}
                                        >
                                            <Typography variant="h4" color="error.main">
                                                {queueHealth.failed_jobs}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {t('Échouées')}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Scheduled Tasks */}
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardHeader
                                title={t('Tâches planifiées')}
                                avatar={<ScheduleIcon />}
                            />
                            <CardContent sx={{ p: 0 }}>
                                <List>
                                    {scheduleInfo.map((task, index) => (
                                        <ListItem
                                            key={task.name}
                                            divider={index < scheduleInfo.length - 1}
                                        >
                                            <ListItemIcon>
                                                <ClockIcon color="action" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={task.label}
                                                secondary={task.schedule}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Last Runs by Job Type */}
                <Paper sx={{ mt: 3, mb: 3 }}>
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="h6">
                            {t('Dernière exécution par tâche')}
                        </Typography>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('Tâche')}</TableCell>
                                    <TableCell>{t('Groupe')}</TableCell>
                                    <TableCell>{t('Dernière exécution')}</TableCell>
                                    <TableCell>{t('Statut')}</TableCell>
                                    <TableCell>{t('Durée')}</TableCell>
                                    <TableCell>{t('Éléments')}</TableCell>
                                    <TableCell align="right">{t('Actions')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(lastRuns).map(([jobName, job]) => {
                                    const GroupIcon = GROUP_ICONS[job.group] || ScheduleIcon;
                                    const StatusIcon = job.last_run 
                                        ? STATUS_ICONS[job.last_run.status] 
                                        : PendingIcon;

                                    return (
                                        <TableRow key={jobName}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <GroupIcon color="action" fontSize="small" />
                                                    <Typography variant="body2">
                                                        {job.job_label}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={job.group_label}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {job.last_run ? (
                                                    <Tooltip title={job.last_run.started_at}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {job.last_run.started_at_human}
                                                        </Typography>
                                                    </Tooltip>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        {t('Jamais exécuté')}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {job.last_run ? (
                                                    <Chip
                                                        icon={<StatusIcon />}
                                                        label={job.last_run.status_label}
                                                        size="small"
                                                        color={STATUS_COLORS[job.last_run.status]}
                                                    />
                                                ) : (
                                                    <Chip
                                                        label={t('N/A')}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {job.last_run?.duration || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {job.last_run?.items_processed ?? '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title={t('Exécuter maintenant')}>
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleTriggerJob(jobName)}
                                                    >
                                                        <RunIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* Recent Runs History */}
                <Paper>
                    <Box
                        sx={{
                            p: 2,
                            borderBottom: 1,
                            borderColor: 'divider',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="h6">
                            {t('Historique des exécutions (7 derniers jours)')}
                        </Typography>
                        <Chip
                            label={`${recentRuns.length} ${t('exécutions')}`}
                            size="small"
                            variant="outlined"
                        />
                    </Box>

                    {recentRuns.length === 0 ? (
                        <EmptyState
                            icon={TimelineIcon}
                            title={t('Aucune exécution')}
                            description={t('Aucune tâche n\'a été exécutée récemment.')}
                        />
                    ) : (
                        <>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>{t('Tâche')}</TableCell>
                                            <TableCell>{t('Groupe')}</TableCell>
                                            <TableCell>{t('Démarré')}</TableCell>
                                            <TableCell>{t('Statut')}</TableCell>
                                            <TableCell>{t('Durée')}</TableCell>
                                            <TableCell>{t('Éléments')}</TableCell>
                                            <TableCell>{t('Erreur')}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {displayedRuns.map((run) => {
                                            const StatusIcon = STATUS_ICONS[run.status] || PendingIcon;

                                            return (
                                                <TableRow
                                                    key={run.id}
                                                    sx={{
                                                        bgcolor: run.status === 'failed'
                                                            ? alpha(theme.palette.error.main, 0.05)
                                                            : 'inherit',
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {run.job_label}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={run.group_label}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title={run.started_at}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {run.started_at_human}
                                                            </Typography>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={<StatusIcon />}
                                                            label={run.status_label}
                                                            size="small"
                                                            color={STATUS_COLORS[run.status]}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {run.duration}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {run.items_processed}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {run.error_message && (
                                                            <Tooltip title={run.error_message}>
                                                                <Typography
                                                                    variant="caption"
                                                                    color="error"
                                                                    sx={{
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: 1,
                                                                        WebkitBoxOrient: 'vertical',
                                                                        overflow: 'hidden',
                                                                        maxWidth: 200,
                                                                    }}
                                                                >
                                                                    {run.error_message}
                                                                </Typography>
                                                            </Tooltip>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {recentRuns.length > 10 && (
                                <Box sx={{ p: 2, textAlign: 'center' }}>
                                    <Button
                                        onClick={() => setShowAllRuns(!showAllRuns)}
                                        endIcon={showAllRuns ? <CollapseIcon /> : <ExpandIcon />}
                                    >
                                        {showAllRuns
                                            ? t('Afficher moins')
                                            : t('Afficher tout (:count)', { count: recentRuns.length })
                                        }
                                    </Button>
                                </Box>
                            )}
                        </>
                    )}
                </Paper>

                {/* Dev Commands Info */}
                <Paper sx={{ mt: 3, p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        {t('Commandes de développement (Laragon)')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        {t('Pour exécuter les tâches planifiées et traiter la file d\'attente en développement local :')}
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Paper
                                variant="outlined"
                                sx={{ p: 2, bgcolor: alpha(theme.palette.grey[900], 0.05) }}
                            >
                                <Typography variant="subtitle2" color="primary" gutterBottom>
                                    {t('Terminal 1 - File d\'attente')}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ fontFamily: 'monospace', bgcolor: 'grey.900', color: 'grey.100', p: 1, borderRadius: 1 }}
                                >
                                    php artisan queue:work --tries=3
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    {t('Traite les jobs en file d\'attente en continu')}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper
                                variant="outlined"
                                sx={{ p: 2, bgcolor: alpha(theme.palette.grey[900], 0.05) }}
                            >
                                <Typography variant="subtitle2" color="primary" gutterBottom>
                                    {t('Terminal 2 - Planificateur')}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ fontFamily: 'monospace', bgcolor: 'grey.900', color: 'grey.100', p: 1, borderRadius: 1 }}
                                >
                                    php artisan schedule:work
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    {t('Exécute les tâches planifiées toutes les minutes')}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </Layout>
    );
}
