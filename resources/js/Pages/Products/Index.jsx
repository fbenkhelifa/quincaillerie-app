import { useContext, useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../../app';
import { FilterBar, PageHeader } from '@/Components/ui';
import ConfirmDialog from '@/Components/ConfirmDialog';
import {
    Box,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    IconButton,
    Tooltip,
    Avatar,
    Paper,
    ButtonGroup,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    AddCircle as AddCircleIcon,
    RemoveCircle as RemoveCircleIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function ProductsIndex({ products, categories, suppliers, filters }) {
    const { t, locale } = useContext(AppContext);
    const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [adjustmentData, setAdjustmentData] = useState({
        quantity_change: 1,
        type: 'adjustment',
        reason: '',
    });
    const [paginationModel, setPaginationModel] = useState({
        pageSize: products.per_page || 25,
        page: (products.current_page || 1) - 1,
    });

    // Filter configuration
    const filterConfig = useMemo(() => [
        {
            id: 'category_id',
            label: t('Catégorie'),
            type: 'select',
            multiple: true,
            width: 3,
            options: categories.map(c => ({ value: c.id, label: locale === 'ar' && c.name_ar ? c.name_ar : c.name })),
        },
        {
            id: 'supplier_id',
            label: t('Fournisseur'),
            type: 'select',
            multiple: true,
            width: 3,
            options: suppliers.map(s => ({ value: s.id, label: s.name })),
        },
        {
            id: 'stock_status',
            label: t('Statut stock'),
            type: 'select',
            width: 3,
            options: [
                { value: 'low', label: t('Stock bas') },
                { value: 'out', label: t('Rupture') },
                { value: 'in', label: t('En stock') },
            ],
        },
    ], [categories, suppliers, t, locale]);

    const handlePageChange = (model) => {
        setPaginationModel(model);
        router.get(
            route('products.index'),
            { ...filters, page: model.page + 1, per_page: model.pageSize },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSort = (sortModel) => {
        if (sortModel.length > 0) {
            const { field, sort } = sortModel[0];
            router.get(
                route('products.index'),
                { ...filters, sort: field, direction: sort, page: 1 },
                { preserveState: true, preserveScroll: true }
            );
        }
    };

    const handleDelete = (product) => {
        setSelectedProduct(product);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('products.destroy', selectedProduct.id), {
            onSuccess: () => {
                toast.success(t('Produit supprimé avec succès'));
                setDeleteDialogOpen(false);
                setSelectedProduct(null);
            },
            onError: () => toast.error(t('Erreur lors de la suppression')),
        });
    };

    const handleAdjustStock = (product, defaultChange = 1) => {
        setSelectedProduct(product);
        setAdjustmentData({
            quantity_change: defaultChange,
            type: 'adjustment',
            reason: '',
        });
        setAdjustDialogOpen(true);
    };

    const confirmAdjustStock = () => {
        router.post(
            route('products.adjust-stock', selectedProduct.id),
            adjustmentData,
            {
                onSuccess: () => {
                    toast.success(t('Stock mis à jour avec succès'));
                    setAdjustDialogOpen(false);
                },
                onError: () => toast.error(t('Erreur lors de la mise à jour du stock')),
            }
        );
    };

    const columns = useMemo(() => [
        {
            field: 'image',
            headerName: '',
            width: 60,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const imageUrl = params.row.image_url;
                const hasImage = imageUrl && imageUrl !== '/storage/' && imageUrl !== null;
                return (
                    <Avatar
                        src={hasImage ? imageUrl : undefined}
                        variant="rounded"
                        sx={{ 
                            width: 40, 
                            height: 40,
                            bgcolor: 'primary.light',
                        }}
                    >
                        {params.row.name?.charAt(0)}
                    </Avatar>
                );
            },
        },
        {
            field: 'name',
            headerName: t('Nom'),
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Box>
                    <Typography variant="body2" fontWeight={500}>
                        {locale === 'ar' && params.row.name_ar ? params.row.name_ar : params.row.name}
                    </Typography>
                    {params.row.sku && (
                        <Typography variant="caption" color="text.secondary">
                            SKU: {params.row.sku}
                        </Typography>
                    )}
                </Box>
            ),
        },
        {
            field: 'barcode',
            headerName: t('Code-barres'),
            width: 130,
        },
        {
            field: 'category',
            headerName: t('Catégorie'),
            width: 150,
            valueGetter: (value, row) => {
                if (locale === 'ar' && row.category?.name_ar) {
                    return row.category.name_ar;
                }
                return row.category?.name || '-';
            },
        },
        {
            field: 'purchase_price',
            headerName: t('Prix achat'),
            width: 110,
            type: 'number',
            valueFormatter: (value) => `${Number(value).toLocaleString()} DA`,
        },
        {
            field: 'selling_price',
            headerName: t('Prix vente'),
            width: 110,
            type: 'number',
            valueFormatter: (value) => `${Number(value).toLocaleString()} DA`,
        },
        {
            field: 'quantity',
            headerName: t('Quantité'),
            width: 180,
            type: 'number',
            renderCell: (params) => {
                const isLow = params.row.is_low_stock;
                const qty = Number(params.row.quantity);
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            label={`${qty} ${params.row.unit}`}
                            size="small"
                            color={qty <= 0 ? 'error' : isLow ? 'warning' : 'success'}
                        />
                        <ButtonGroup size="small" variant="text">
                            <Tooltip title={t('Retirer')}>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAdjustStock(params.row, -1);
                                    }}
                                    disabled={qty <= 0}
                                    aria-label={t('Remove stock')}
                                >
                                    <RemoveCircleIcon fontSize="small" color={qty <= 0 ? 'disabled' : 'error'} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t('Ajouter')}>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAdjustStock(params.row, 1);
                                    }}
                                    aria-label={t('Add stock')}
                                >
                                    <AddCircleIcon fontSize="small" color="success" />
                                </IconButton>
                            </Tooltip>
                        </ButtonGroup>
                    </Box>
                );
            },
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: t('Actions'),
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label={t('Modifier')}
                    onClick={() => router.get(route('products.edit', params.row.id))}
                    showInMenu={false}
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
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
            title={t('Produits')}
            breadcrumbs={[{ label: t('Produits') }]}
        >
            <Head title={t('Produits')} />

            {/* Page Header with Actions */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box />
                <Button
                    component={Link}
                    href={route('products.create')}
                    variant="contained"
                    startIcon={<AddIcon />}
                    size="large"
                >
                    {t('Nouveau produit')}
                </Button>
            </Box>

            {/* Enhanced Filter Bar */}
            <FilterBar
                filters={filters}
                filterConfig={filterConfig}
                routeName="products.index"
                searchPlaceholder={t('Rechercher par nom, code-barres, SKU...')}
                showPresets={true}
            />

            {/* Data Table */}
            <Paper sx={{ overflow: 'hidden' }}>
                <DataGrid
                    rows={products.data || []}
                    columns={columns}
                    rowCount={products.total || 0}
                    paginationMode="server"
                    sortingMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={handlePageChange}
                    onSortModelChange={handleSort}
                    pageSizeOptions={[10, 25, 50, 100]}
                    disableRowSelectionOnClick
                    autoHeight
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-cell:focus': {
                            outline: 'none',
                        },
                    }}
                    localeText={{
                        noRowsLabel: t('Aucun produit trouvé'),
                        MuiTablePagination: {
                            labelRowsPerPage: t('Lignes par page'),
                            labelDisplayedRows: ({ from, to, count }) =>
                                `${from}-${to} ${t('sur')} ${count}`,
                        },
                    }}
                />
            </Paper>

            {/* Stock Adjustment Dialog */}
            <Dialog
                open={adjustDialogOpen}
                onClose={() => setAdjustDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {t('Ajuster le stock')} - {selectedProduct?.name}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            {t('Stock actuel')}: <strong>{selectedProduct?.quantity} {selectedProduct?.unit}</strong>
                        </Typography>
                        
                        <TextField
                            label={t('Quantité à ajouter/retirer')}
                            type="number"
                            value={adjustmentData.quantity_change}
                            onChange={(e) => setAdjustmentData({
                                ...adjustmentData,
                                quantity_change: parseFloat(e.target.value) || 0,
                            })}
                            helperText={t('Utilisez un nombre négatif pour retirer du stock')}
                            fullWidth
                        />

                        <FormControl fullWidth>
                            <InputLabel>{t('Type de mouvement')}</InputLabel>
                            <Select
                                value={adjustmentData.type}
                                onChange={(e) => setAdjustmentData({
                                    ...adjustmentData,
                                    type: e.target.value,
                                })}
                                label={t('Type de mouvement')}
                            >
                                <MenuItem value="purchase">{t('Achat')}</MenuItem>
                                <MenuItem value="adjustment">{t('Ajustement')}</MenuItem>
                                <MenuItem value="return">{t('Retour')}</MenuItem>
                                <MenuItem value="damage">{t('Dommage')}</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label={t('Raison')}
                            value={adjustmentData.reason}
                            onChange={(e) => setAdjustmentData({
                                ...adjustmentData,
                                reason: e.target.value,
                            })}
                            fullWidth
                            multiline
                            rows={2}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setAdjustDialogOpen(false)} color="inherit">
                        {t('Annuler')}
                    </Button>
                    <Button onClick={confirmAdjustStock} variant="contained">
                        {t('Confirmer')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title={t('Supprimer le produit')}
                message={t('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')}
                confirmText={t('Supprimer')}
                cancelText={t('Annuler')}
                severity="danger"
            />
        </Layout>
    );
}
