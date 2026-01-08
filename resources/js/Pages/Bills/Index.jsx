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
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Visibility as ViewIcon,
    PictureAsPdf as PdfIcon,
    Receipt as ReceiptIcon,
} from '@mui/icons-material';

export default function BillsIndex({ bills, filters }) {
    const { t, locale } = useContext(AppContext);
    const [paginationModel, setPaginationModel] = useState({
        pageSize: bills.per_page || 25,
        page: (bills.current_page || 1) - 1,
    });

    // Filter configuration with date range support
    const filterConfig = useMemo(() => [
        {
            id: 'status',
            label: t('Statut'),
            type: 'select',
            width: 3,
            options: [
                { value: 'pending', label: t('En attente') },
                { value: 'completed', label: t('Terminée') },
                { value: 'cancelled', label: t('Annulée') },
            ],
        },
        {
            id: 'payment_method',
            label: t('Mode de paiement'),
            type: 'select',
            width: 3,
            options: [
                { value: 'cash', label: t('Espèces') },
                { value: 'card', label: t('Carte') },
                { value: 'check', label: t('Chèque') },
                { value: 'credit', label: t('Crédit') },
            ],
        },
    ], [t]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
            minimumFractionDigits: 2,
        }).format(value) + ' DA';
    };

    const statusColors = {
        pending: 'warning',
        completed: 'success',
        cancelled: 'error',
    };

    const statusLabels = {
        pending: t('En attente'),
        completed: t('Terminée'),
        cancelled: t('Annulée'),
    };

    const paymentMethodLabels = {
        cash: t('Espèces'),
        card: t('Carte'),
        check: t('Chèque'),
        credit: t('Crédit'),
        other: t('Autre'),
    };

    const handlePageChange = (model) => {
        setPaginationModel(model);
        router.get(
            route('bills.index'),
            { ...filters, page: model.page + 1, per_page: model.pageSize },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSort = (sortModel) => {
        if (sortModel.length > 0) {
            const { field, sort } = sortModel[0];
            router.get(
                route('bills.index'),
                { ...filters, sort: field, direction: sort },
                { preserveState: true, preserveScroll: true }
            );
        }
    };

    const columns = useMemo(() => [
        {
            field: 'bill_number',
            headerName: t('N° Facture'),
            width: 150,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                        <ReceiptIcon fontSize="small" color="primary" />
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                        {params.value}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'customer_name',
            headerName: t('Client'),
            flex: 1,
            minWidth: 150,
            valueGetter: (value) => value || '-',
        },
        {
            field: 'worker',
            headerName: t('Vendeur'),
            width: 150,
            valueGetter: (value, row) => row.worker?.name || '-',
        },
        {
            field: 'total',
            headerName: t('Total'),
            width: 140,
            type: 'number',
            renderCell: (params) => (
                <Typography fontWeight={600} color="primary.main">
                    {formatCurrency(params.value)}
                </Typography>
            ),
        },
        {
            field: 'payment_method',
            headerName: t('Paiement'),
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={paymentMethodLabels[params.value] || params.value}
                    size="small"
                    variant="outlined"
                />
            ),
        },
        {
            field: 'status',
            headerName: t('Statut'),
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={statusLabels[params.value] || params.value}
                    size="small"
                    color={statusColors[params.value] || 'default'}
                />
            ),
        },
        {
            field: 'created_at',
            headerName: t('Date'),
            width: 170,
            valueFormatter: (value) => {
                return new Date(value).toLocaleDateString(
                    locale === 'ar' ? 'ar-DZ' : 'fr-FR',
                    { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
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
                    icon={
                        <Tooltip title={t('Voir détails')}>
                            <ViewIcon />
                        </Tooltip>
                    }
                    label={t('Voir')}
                    onClick={() => router.get(route('bills.show', params.row.id))}
                    showInMenu={false}
                />,
                <GridActionsCellItem
                    icon={
                        <Tooltip title={t('Télécharger PDF')}>
                            <PdfIcon />
                        </Tooltip>
                    }
                    label={t('PDF')}
                    onClick={() => window.open(route('bills.pdf', { bill: params.row.id, lang: locale }), '_blank')}
                    showInMenu={false}
                    sx={{ color: 'error.main' }}
                />,
            ],
        },
    ], [t, locale]);

    return (
        <Layout
            title={t('Factures')}
            breadcrumbs={[{ label: t('Factures') }]}
        >
            <Head title={t('Factures')} />

            {/* Page Header with Actions */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box />
                <Button
                    component={Link}
                    href={route('bills.create')}
                    variant="contained"
                    startIcon={<AddIcon />}
                    size="large"
                >
                    {t('Nouvelle facture')}
                </Button>
            </Box>

            {/* Enhanced Filter Bar with Date Range */}
            <FilterBar
                filters={filters}
                filterConfig={filterConfig}
                routeName="bills.index"
                searchPlaceholder={t('Rechercher par numéro, client...')}
                showDateRange={true}
                dateFromKey="date_from"
                dateToKey="date_to"
                showPresets={true}
            />

            {/* Data Table */}
            <Paper sx={{ overflow: 'hidden' }}>
                {(bills.data?.length > 0 || filters.search || filters.status || filters.payment_method || filters.date_from) ? (
                    <DataGrid
                        rows={bills.data || []}
                        columns={columns}
                        rowCount={bills.total || 0}
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
                            noRowsLabel: t('Aucune facture trouvée'),
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
                        icon={ReceiptIcon}
                        title={t('Aucune facture')}
                        description={t('Commencez par créer votre première facture')}
                        actionLabel={t('Nouvelle facture')}
                        onAction={() => router.get(route('bills.create'))}
                    />
                )}
            </Paper>
        </Layout>
    );
}
