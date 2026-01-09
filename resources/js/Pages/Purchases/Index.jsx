import { useContext, useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../../app';
import { FilterBar, EmptyState } from '@/Components/ui';
import {
    Box,
    Button,
    Paper,
    Typography,
    Chip,
    IconButton,
    Tooltip,
    alpha,
    Card,
    CardContent,
    Grid,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Visibility as ViewIcon,
    PictureAsPdf as PdfIcon,
    LocalShipping as ShippingIcon,
    Inventory as InventoryIcon,
    Send as SendIcon,
    Cancel as CancelIcon,
} from '@mui/icons-material';

export default function PurchasesIndex({ orders, suppliers, filters, stats }) {
    const { t, locale } = useContext(AppContext);
    const [paginationModel, setPaginationModel] = useState({
        pageSize: orders.per_page || 15,
        page: (orders.current_page || 1) - 1,
    });

    const filterConfig = useMemo(() => [
        {
            id: 'status',
            label: t('Statut'),
            type: 'select',
            width: 3,
            options: [
                { value: 'draft', label: t('Brouillon') },
                { value: 'sent', label: t('Envoyée') },
                { value: 'partial', label: t('Partielle') },
                { value: 'received', label: t('Reçue') },
                { value: 'cancelled', label: t('Annulée') },
            ],
        },
        {
            id: 'supplier_id',
            label: t('Fournisseur'),
            type: 'select',
            width: 3,
            options: suppliers.map(s => ({ value: s.id, label: s.name })),
        },
    ], [t, suppliers]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
            minimumFractionDigits: 2,
        }).format(value) + ' DA';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-FR');
    };

    const statusColors = {
        draft: 'default',
        sent: 'info',
        partial: 'warning',
        received: 'success',
        cancelled: 'error',
    };

    const statusLabels = {
        draft: t('Brouillon'),
        sent: t('Envoyée'),
        partial: t('Partielle'),
        received: t('Reçue'),
        cancelled: t('Annulée'),
    };

    const handlePageChange = (model) => {
        setPaginationModel(model);
        router.get(
            route('purchases.index'),
            { ...filters, page: model.page + 1, per_page: model.pageSize },
            { preserveState: true, preserveScroll: true }
        );
    };

    const columns = useMemo(() => [
        {
            field: 'po_number',
            headerName: t('N° Commande'),
            flex: 1,
            minWidth: 130,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={500}>
                    {params.value}
                </Typography>
            ),
        },
        {
            field: 'supplier',
            headerName: t('Fournisseur'),
            flex: 1.5,
            minWidth: 150,
            valueGetter: (value, row) => row.supplier?.name || '-',
        },
        {
            field: 'order_date',
            headerName: t('Date'),
            width: 110,
            valueFormatter: (value) => formatDate(value),
        },
        {
            field: 'expected_date',
            headerName: t('Prévue'),
            width: 110,
            valueFormatter: (value) => formatDate(value),
        },
        {
            field: 'items_count',
            headerName: t('Articles'),
            width: 90,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'total',
            headerName: t('Total'),
            width: 130,
            align: 'right',
            headerAlign: 'right',
            valueFormatter: (value) => formatCurrency(value || 0),
        },
        {
            field: 'status',
            headerName: t('Statut'),
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={statusLabels[params.value] || params.value}
                    color={statusColors[params.value] || 'default'}
                    size="small"
                />
            ),
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: t('Actions'),
            width: 130,
            getActions: (params) => {
                const actions = [
                    <GridActionsCellItem
                        key="view"
                        icon={<ViewIcon />}
                        label={t('Voir')}
                        onClick={() => router.visit(route('purchases.show', params.id))}
                    />,
                    <GridActionsCellItem
                        key="pdf"
                        icon={<PdfIcon />}
                        label={t('PDF')}
                        onClick={() => window.open(route('purchases.pdf', params.id), '_blank')}
                    />,
                ];

                if (params.row.status === 'sent' || params.row.status === 'partial') {
                    actions.push(
                        <GridActionsCellItem
                            key="receive"
                            icon={<InventoryIcon color="success" />}
                            label={t('Recevoir')}
                            onClick={() => router.visit(route('purchases.receive.form', params.id))}
                        />
                    );
                }

                return actions;
            },
        },
    ], [t, locale]);

    const rows = orders.data || [];

    return (
        <Layout>
            <Head title={t('Commandes d\'achat')} />

            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">
                        {t('Commandes d\'achat')}
                    </Typography>
                    <Button
                        component={Link}
                        href={route('purchases.create')}
                        variant="contained"
                        startIcon={<AddIcon />}
                    >
                        {t('Nouvelle commande')}
                    </Button>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h4" color="warning.main">
                                    {stats.draft}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('Brouillons')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h4" color="info.main">
                                    {stats.pending}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('En attente')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h4" color="success.main">
                                    {stats.received_this_month}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('Reçues ce mois')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters */}
                <FilterBar
                    filterConfig={filterConfig}
                    filters={filters}
                    routeName="purchases.index"
                    searchPlaceholder={t('Rechercher par N° ou fournisseur...')}
                    showDateRange={true}
                />

                {/* Data Grid */}
                <Paper sx={{ mt: 2 }}>
                    {rows.length > 0 ? (
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            paginationModel={paginationModel}
                            onPaginationModelChange={handlePageChange}
                            pageSizeOptions={[10, 15, 25, 50]}
                            paginationMode="server"
                            rowCount={orders.total || 0}
                            autoHeight
                            disableRowSelectionOnClick
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-cell:focus': { outline: 'none' },
                            }}
                        />
                    ) : (
                        <EmptyState
                            icon={ShippingIcon}
                            title={t('Aucune commande d\'achat')}
                            description={t('Créez votre première commande d\'achat pour approvisionner votre stock.')}
                            action={
                                <Button
                                    component={Link}
                                    href={route('purchases.create')}
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                >
                                    {t('Nouvelle commande')}
                                </Button>
                            }
                        />
                    )}
                </Paper>
            </Box>
        </Layout>
    );
}
