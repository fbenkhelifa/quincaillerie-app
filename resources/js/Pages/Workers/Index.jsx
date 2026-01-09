import { useContext, useState, useMemo } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../../app';
import { FilterBar, EmptyState } from '@/Components/ui';
import ConfirmDialog from '@/Components/ConfirmDialog';
import {
    Box,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    FormControlLabel,
    Switch,
    Tooltip,
    Avatar,
    alpha,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Badge as BadgeIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function WorkersIndex({ workers, filters }) {
    const { t, locale } = useContext(AppContext);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingWorker, setEditingWorker] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [workerToDelete, setWorkerToDelete] = useState(null);
    const [paginationModel, setPaginationModel] = useState({
        pageSize: workers.per_page || 25,
        page: (workers.current_page || 1) - 1,
    });

    const { data, setData, post, put, reset, processing, errors } = useForm({
        name: '',
        phone: '',
        role: 'cashier',
        hire_date: null,
        is_active: true,
        notes: '',
    });

    // Filter configuration
    const filterConfig = useMemo(() => [
        {
            id: 'role',
            label: t('Rôle'),
            type: 'select',
            width: 3,
            options: [
                { value: 'manager', label: t('Gérant') },
                { value: 'cashier', label: t('Caissier') },
                { value: 'warehouse', label: t('Magasinier') },
                { value: 'other', label: t('Autre') },
            ],
        },
        {
            id: 'is_active',
            label: t('Statut'),
            type: 'select',
            width: 3,
            options: [
                { value: '1', label: t('Actif') },
                { value: '0', label: t('Inactif') },
            ],
        },
    ], [t]);

    const handlePageChange = (model) => {
        setPaginationModel(model);
        router.get(
            route('workers.index'),
            { ...filters, page: model.page + 1, per_page: model.pageSize },
            { preserveState: true, preserveScroll: true }
        );
    };

    const openCreateDialog = () => {
        reset();
        setEditingWorker(null);
        setDialogOpen(true);
    };

    const openEditDialog = (worker) => {
        setEditingWorker(worker);
        setData({
            name: worker.name,
            phone: worker.phone || '',
            role: worker.role,
            hire_date: worker.hire_date ? dayjs(worker.hire_date) : null,
            is_active: worker.is_active,
            notes: worker.notes || '',
        });
        setDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = {
            ...data,
            hire_date: data.hire_date ? data.hire_date.format('YYYY-MM-DD') : null,
        };

        if (editingWorker) {
            put(route('workers.update', editingWorker.id), {
                data: formData,
                onSuccess: () => {
                    toast.success(t('Employé mis à jour avec succès'));
                    setDialogOpen(false);
                },
                onError: () => toast.error(t('Erreur lors de la mise à jour')),
            });
        } else {
            post(route('workers.store'), {
                data: formData,
                onSuccess: () => {
                    toast.success(t('Employé créé avec succès'));
                    setDialogOpen(false);
                },
                onError: () => toast.error(t('Erreur lors de la création')),
            });
        }
    };

    const handleDelete = (worker) => {
        setWorkerToDelete(worker);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('workers.destroy', workerToDelete.id), {
            onSuccess: () => {
                toast.success(t('Employé supprimé avec succès'));
                setDeleteDialogOpen(false);
                setWorkerToDelete(null);
            },
            onError: () => toast.error(t('Erreur lors de la suppression')),
        });
    };

    const roleLabels = {
        manager: t('Gérant'),
        cashier: t('Caissier'),
        warehouse: t('Magasinier'),
        other: t('Autre'),
    };

    const roleColors = {
        manager: 'primary',
        cashier: 'info',
        warehouse: 'warning',
        other: 'default',
    };

    const columns = useMemo(() => [
        {
            field: 'name',
            headerName: t('Employé'),
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                            color: 'info.main',
                        }}
                    >
                        {params.value?.charAt(0)}
                    </Avatar>
                    <span style={{ fontWeight: 500 }}>{params.value}</span>
                </Box>
            ),
        },
        {
            field: 'phone',
            headerName: t('Téléphone'),
            width: 140,
            valueGetter: (value) => value || '-',
        },
        {
            field: 'role',
            headerName: t('Rôle'),
            width: 130,
            renderCell: (params) => (
                <Chip
                    icon={<BadgeIcon sx={{ fontSize: 16 }} />}
                    label={roleLabels[params.value]}
                    size="small"
                    color={roleColors[params.value]}
                />
            ),
        },
        {
            field: 'hire_date',
            headerName: t('Date embauche'),
            width: 140,
            valueFormatter: (value) => {
                if (!value) return '-';
                return new Date(value).toLocaleDateString(
                    locale === 'ar' ? 'ar-DZ' : 'fr-FR',
                    { day: '2-digit', month: '2-digit', year: 'numeric' }
                );
            },
        },
        {
            field: 'is_active',
            headerName: t('Statut'),
            width: 110,
            renderCell: (params) => (
                <Chip
                    label={params.value ? t('Actif') : t('Inactif')}
                    size="small"
                    color={params.value ? 'success' : 'error'}
                />
            ),
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: t('Actions'),
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={
                        <Tooltip title={t('Modifier')}>
                            <EditIcon />
                        </Tooltip>
                    }
                    label={t('Modifier')}
                    onClick={() => openEditDialog(params.row)}
                    showInMenu={false}
                />,
                <GridActionsCellItem
                    icon={
                        <Tooltip title={t('Supprimer')}>
                            <DeleteIcon />
                        </Tooltip>
                    }
                    label={t('Supprimer')}
                    onClick={() => handleDelete(params.row)}
                    showInMenu={false}
                    sx={{ color: 'error.main' }}
                />,
            ],
        },
    ], [t, locale]);

    return (
        <Layout
            title={t('Employés')}
            breadcrumbs={[{ label: t('Employés') }]}
        >
            <Head title={t('Employés')} />

            {/* Page Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreateDialog}
                    size="large"
                >
                    {t('Nouvel employé')}
                </Button>
            </Box>

            {/* Filter Bar */}
            <FilterBar
                filters={filters}
                filterConfig={filterConfig}
                routeName="workers.index"
                searchPlaceholder={t('Rechercher par nom ou téléphone...')}
            />

            {/* Data Table or Empty State */}
            <Paper sx={{ overflow: 'hidden' }}>
                {(workers.data?.length > 0 || filters.search) ? (
                    <DataGrid
                        rows={workers.data || []}
                        columns={columns}
                        rowCount={workers.total || 0}
                        paginationMode="server"
                        paginationModel={paginationModel}
                        onPaginationModelChange={handlePageChange}
                        pageSizeOptions={[10, 25, 50]}
                        disableRowSelectionOnClick
                        autoHeight
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-cell:focus': {
                                outline: 'none',
                            },
                        }}
                        localeText={{
                            noRowsLabel: t('Aucun employé trouvé'),
                            MuiTablePagination: {
                                labelRowsPerPage: t('Lignes par page'),
                                labelDisplayedRows: ({ from, to, count }) =>
                                    `${from}-${to} ${t('sur')} ${count}`,
                            },
                        }}
                    />
                ) : (
                    <EmptyState
                        type="empty"
                        icon={PersonIcon}
                        title={t('Aucun employé')}
                        description={t('Commencez par ajouter vos employés pour gérer votre équipe')}
                        actionLabel={t('Nouvel employé')}
                        onAction={openCreateDialog}
                    />
                )}
            </Paper>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        {editingWorker ? t('Modifier employé') : t('Nouvel employé')}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                            <TextField
                                label={t('Nom')}
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={!!errors.name}
                                helperText={errors.name}
                                fullWidth
                                required
                            />
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <TextField
                                    label={t('Téléphone')}
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    error={!!errors.phone}
                                    helperText={errors.phone}
                                    fullWidth
                                />
                                <FormControl fullWidth>
                                    <InputLabel>{t('Rôle')}</InputLabel>
                                    <Select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        label={t('Rôle')}
                                    >
                                        <MenuItem value="manager">{t('Gérant')}</MenuItem>
                                        <MenuItem value="cashier">{t('Caissier')}</MenuItem>
                                        <MenuItem value="warehouse">{t('Magasinier')}</MenuItem>
                                        <MenuItem value="other">{t('Autre')}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            <DatePicker
                                label={t('Date d\'embauche')}
                                value={data.hire_date}
                                onChange={(value) => setData('hire_date', value)}
                                slotProps={{
                                    textField: { fullWidth: true },
                                }}
                            />
                            <TextField
                                label={t('Notes')}
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                multiline
                                rows={3}
                                fullWidth
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                }
                                label={t('Actif')}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2.5 }}>
                        <Button onClick={() => setDialogOpen(false)} color="inherit">
                            {t('Annuler')}
                        </Button>
                        <Button type="submit" variant="contained" disabled={processing}>
                            {t('Enregistrer')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title={t('Supprimer employé')}
                message={t('Êtes-vous sûr de vouloir supprimer cet employé ?')}
                severity="danger"
            />
        </Layout>
    );
}
