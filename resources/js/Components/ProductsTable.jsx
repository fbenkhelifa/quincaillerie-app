import { useContext, useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import {
    Box,
    Chip,
    IconButton,
    Tooltip,
    Avatar,
    Typography,
    ButtonGroup,
    Button,
    Menu,
    MenuItem,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
    MoreVert as MoreIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import { AppContext } from '../app';
import ConfirmDialog from './ConfirmDialog';

export default function ProductsTable({
    products,
    onDelete,
    onAdjustStock,
}) {
    const { t, locale } = useContext(AppContext);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [paginationModel, setPaginationModel] = useState({
        pageSize: products.per_page || 25,
        page: (products.current_page || 1) - 1,
    });

    const handlePageChange = (model) => {
        setPaginationModel(model);
        router.get(
            route('products.index'),
            { page: model.page + 1, per_page: model.pageSize },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSort = (sortModel) => {
        if (sortModel.length > 0) {
            const { field, sort } = sortModel[0];
            router.get(
                route('products.index'),
                { sort: field, direction: sort },
                { preserveState: true, preserveScroll: true }
            );
        }
    };

    const handleDelete = (product) => {
        setSelectedProduct(product);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedProduct) {
            onDelete(selectedProduct.id);
        }
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
                    <Typography variant="body2" fontWeight="medium">
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
            field: 'suppliers',
            headerName: t('Fournisseur'),
            width: 150,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {params.row.suppliers?.slice(0, 2).map((supplier) => (
                        <Chip
                            key={supplier.id}
                            label={supplier.name}
                            size="small"
                            variant="outlined"
                        />
                    ))}
                    {params.row.suppliers?.length > 2 && (
                        <Chip
                            label={`+${params.row.suppliers.length - 2}`}
                            size="small"
                        />
                    )}
                </Box>
            ),
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
            width: 140,
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
                        <ButtonGroup size="small" variant="outlined">
                            <Tooltip title={t('Retirer')}>
                                <IconButton
                                    size="small"
                                    onClick={() => onAdjustStock(params.row, -1)}
                                    disabled={qty <= 0}
                                >
                                    <RemoveIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t('Ajouter')}>
                                <IconButton
                                    size="small"
                                    onClick={() => onAdjustStock(params.row, 1)}
                                >
                                    <AddIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </ButtonGroup>
                    </Box>
                );
            },
        },
        {
            field: 'created_at',
            headerName: t('Date création'),
            width: 120,
            valueFormatter: (value) => {
                if (!value) return '-';
                return new Date(value).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-FR');
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
    ], [t, locale, onAdjustStock]);

    return (
        <>
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
                    bgcolor: 'background.paper',
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

            <ConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title={t('Supprimer le produit')}
                message={t('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')}
                confirmText={t('Supprimer')}
                cancelText={t('Annuler')}
            />
        </>
    );
}
