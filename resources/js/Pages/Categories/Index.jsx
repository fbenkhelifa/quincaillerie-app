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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Tooltip,
    alpha,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Folder as FolderIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function CategoriesIndex({ categories }) {
    const { t, locale } = useContext(AppContext);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // Extract data from paginated response or use array directly
    const categoriesData = Array.isArray(categories) ? categories : (categories?.data || []);

    const { data, setData, post, put, reset, processing, errors } = useForm({
        name: '',
        name_ar: '',
        description: '',
    });

    const openCreateDialog = () => {
        reset();
        setEditingCategory(null);
        setDialogOpen(true);
    };

    const openEditDialog = (category) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            name_ar: category.name_ar || '',
            description: category.description || '',
        });
        setDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            put(route('categories.update', editingCategory.id), {
                onSuccess: () => {
                    toast.success(t('Catégorie mise à jour avec succès'));
                    setDialogOpen(false);
                },
                onError: () => toast.error(t('Erreur lors de la mise à jour')),
            });
        } else {
            post(route('categories.store'), {
                onSuccess: () => {
                    toast.success(t('Catégorie créée avec succès'));
                    setDialogOpen(false);
                },
                onError: () => toast.error(t('Erreur lors de la création')),
            });
        }
    };

    const handleDelete = (category) => {
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('categories.destroy', categoryToDelete.id), {
            onSuccess: () => {
                toast.success(t('Catégorie supprimée avec succès'));
                setDeleteDialogOpen(false);
                setCategoryToDelete(null);
            },
            onError: () => toast.error(t('Erreur: cette catégorie contient des produits')),
        });
    };

    const columns = useMemo(() => [
        {
            field: 'name',
            headerName: t('Nom'),
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <FolderIcon fontSize="small" color="primary" />
                    </Box>
                    <span style={{ fontWeight: 500 }}>{params.value}</span>
                </Box>
            ),
        },
        {
            field: 'name_ar',
            headerName: t('Nom (arabe)'),
            width: 180,
            renderCell: (params) => (
                <span dir="rtl" style={{ fontFamily: 'Noto Sans Arabic, Cairo, sans-serif' }}>
                    {params.value || '-'}
                </span>
            ),
        },
        {
            field: 'description',
            headerName: t('Description'),
            flex: 1,
            minWidth: 200,
            valueGetter: (value) => value || '-',
        },
        {
            field: 'products_count',
            headerName: t('Produits'),
            width: 120,
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
                        <Tooltip title={params.row.products_count > 0 ? t('Catégorie avec produits') : t('Supprimer')}>
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
            title={t('Catégories')}
            breadcrumbs={[{ label: t('Catégories') }]}
        >
            <Head title={t('Catégories')} />

            {/* Page Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreateDialog}
                    size="large"
                >
                    {t('Nouvelle catégorie')}
                </Button>
            </Box>

            {/* Data Table or Empty State */}
            <Paper sx={{ overflow: 'hidden' }}>
                {categoriesData?.length > 0 ? (
                    <DataGrid
                        rows={categoriesData}
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
                            noRowsLabel: t('Aucune catégorie trouvée'),
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
                        icon={FolderIcon}
                        title={t('Aucune catégorie')}
                        description={t('Commencez par créer votre première catégorie pour organiser vos produits')}
                        actionLabel={t('Nouvelle catégorie')}
                        onAction={openCreateDialog}
                    />
                )}
            </Paper>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        {editingCategory ? t('Modifier catégorie') : t('Nouvelle catégorie')}
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
                                label={t('Nom (arabe)')}
                                value={data.name_ar}
                                onChange={(e) => setData('name_ar', e.target.value)}
                                fullWidth
                                dir="rtl"
                                inputProps={{ style: { fontFamily: 'Noto Sans Arabic, Cairo, sans-serif' } }}
                            />
                            <TextField
                                label={t('Description')}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                multiline
                                rows={3}
                                fullWidth
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
                title={t('Supprimer catégorie')}
                message={t('Êtes-vous sûr de vouloir supprimer cette catégorie ?')}
                severity="danger"
            />
        </Layout>
    );
}
