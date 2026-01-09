import { useContext, useState, useMemo } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../../app';
import { EmptyState } from '@/Components/ui';
import ConfirmDialog from '@/Components/ConfirmDialog';
import {
    Box,
    Button,
    TextField,
    Paper,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    FormControlLabel,
    Switch,
    Tooltip,
    alpha,
    Avatar,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    LocalShipping as ShippingIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function SuppliersIndex({ suppliers }) {
    const { t } = useContext(AppContext);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState(null);

    // Extract data from paginated response or use array directly
    const suppliersData = Array.isArray(suppliers) ? suppliers : (suppliers?.data || []);

    const { data, setData, post, put, reset, processing, errors } = useForm({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        is_active: true,
    });

    const openCreateDialog = () => {
        reset();
        setEditingSupplier(null);
        setDialogOpen(true);
    };

    const openEditDialog = (supplier) => {
        setEditingSupplier(supplier);
        setData({
            name: supplier.name,
            contact_person: supplier.contact_person || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
            notes: supplier.notes || '',
            is_active: supplier.is_active,
        });
        setDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingSupplier) {
            put(route('suppliers.update', editingSupplier.id), {
                onSuccess: () => {
                    toast.success(t('Fournisseur mis à jour avec succès'));
                    setDialogOpen(false);
                },
                onError: () => toast.error(t('Erreur lors de la mise à jour')),
            });
        } else {
            post(route('suppliers.store'), {
                onSuccess: () => {
                    toast.success(t('Fournisseur créé avec succès'));
                    setDialogOpen(false);
                },
                onError: () => toast.error(t('Erreur lors de la création')),
            });
        }
    };

    const handleDelete = (supplier) => {
        setSupplierToDelete(supplier);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('suppliers.destroy', supplierToDelete.id), {
            onSuccess: () => toast.success(t('Fournisseur supprimé avec succès')),
            onError: () => toast.error(t('Erreur: ce fournisseur a des produits associés')),
        });
    };

    const columns = useMemo(() => [
        {
            field: 'name',
            headerName: t('Fournisseur'),
            flex: 1,
            minWidth: 220,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
                            color: 'secondary.main',
                        }}
                    >
                        {params.value?.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight={500}>
                            {params.value}
                        </Typography>
                        {params.row.contact_person && (
                            <Typography variant="caption" color="text.secondary">
                                {params.row.contact_person}
                            </Typography>
                        )}
                    </Box>
                </Box>
            ),
        },
        {
            field: 'phone',
            headerName: t('Téléphone'),
            width: 150,
            renderCell: (params) => (
                params.value ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        <span>{params.value}</span>
                    </Box>
                ) : '-'
            ),
        },
        {
            field: 'email',
            headerName: t('Email'),
            width: 200,
            renderCell: (params) => (
                params.value ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2" noWrap sx={{ maxWidth: 170 }}>
                            {params.value}
                        </Typography>
                    </Box>
                ) : '-'
            ),
        },
        {
            field: 'products_count',
            headerName: t('Produits'),
            width: 110,
            type: 'number',
            renderCell: (params) => (
                <Chip
                    label={params.value || 0}
                    size="small"
                    color={params.value > 0 ? 'primary' : 'default'}
                    variant={params.value > 0 ? 'filled' : 'outlined'}
                />
            ),
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
                        <Tooltip title={params.row.products_count > 0 ? t('Fournisseur avec produits') : t('Supprimer')}>
                            <DeleteIcon />
                        </Tooltip>
                    }
                    label={t('Supprimer')}
                    onClick={() => handleDelete(params.row)}
                    showInMenu={false}
                    disabled={params.row.products_count > 0}
                    sx={{ color: params.row.products_count > 0 ? 'action.disabled' : 'error.main' }}
                />,
            ],
        },
    ], [t]);

    return (
        <Layout
            title={t('Fournisseurs')}
            breadcrumbs={[{ label: t('Fournisseurs') }]}
        >
            <Head title={t('Fournisseurs')} />

            {/* Page Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreateDialog}
                    size="large"
                >
                    {t('Nouveau fournisseur')}
                </Button>
            </Box>

            {/* Data Table or Empty State */}
            <Paper sx={{ overflow: 'hidden' }}>
                {suppliersData?.length > 0 ? (
                    <DataGrid
                        rows={suppliersData}
                        columns={columns}
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 25 } },
                        }}
                        disableRowSelectionOnClick
                        autoHeight
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-cell:focus': {
                                outline: 'none',
                            },
                        }}
                        localeText={{
                            noRowsLabel: t('Aucun fournisseur trouvé'),
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
                        icon={ShippingIcon}
                        title={t('Aucun fournisseur')}
                        description={t('Commencez par ajouter vos premiers fournisseurs')}
                        actionLabel={t('Nouveau fournisseur')}
                        onAction={openCreateDialog}
                    />
                )}
            </Paper>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        {editingSupplier ? t('Modifier fournisseur') : t('Nouveau fournisseur')}
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
                            <TextField
                                label={t('Personne de contact')}
                                value={data.contact_person}
                                onChange={(e) => setData('contact_person', e.target.value)}
                                fullWidth
                            />
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <TextField
                                    label={t('Téléphone')}
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    label={t('Email')}
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    fullWidth
                                />
                            </Box>
                            <TextField
                                label={t('Adresse')}
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                multiline
                                rows={2}
                                fullWidth
                            />
                            <TextField
                                label={t('Notes')}
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                multiline
                                rows={2}
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
                title={t('Supprimer fournisseur')}
                message={t('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')}
                severity="danger"
            />
        </Layout>
    );
}
