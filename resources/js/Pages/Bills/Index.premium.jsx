/**
 * Bills/Index - Premium Version
 * =============================
 * Uses ProDataTable for bills management
 * Detail drawer showing line items, totals, and actions
 */

import { useContext, useState, useMemo, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '@/app';
import { PageHeader, ProDataTable } from '@/Components/ui';
import { BaseDetailDrawer, DetailSection, DetailRow, StatusBadge, MetricDisplay } from '@/Components/Drawers';
import ConfirmDialog from '@/Components/ConfirmDialog';
import {
  Box,
  Button,
  Chip,
  Stack,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { formatCurrency, getTrendInfo } from '@/utils/premiumUI';

export default function BillsIndex({ bills, filters: initialFilters }) {
  const { t, locale } = useContext(AppContext);
  const theme = useTheme();

  // State
  const [selectedBill, setSelectedBill] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);

  // Table state
  const [page, setPage] = useState((bills.current_page || 1) - 1);
  const [pageSize, setPageSize] = useState(bills.per_page || 25);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState(initialFilters || {});

  // Handlers
  const handlePageChange = useCallback(
    (newPage) => {
      setPage(newPage);
      router.get(
        route('bills.index'),
        { ...filters, page: newPage + 1, per_page: pageSize, sort: sortBy, direction: sortOrder },
        { preserveState: true, preserveScroll: true }
      );
    },
    [filters, pageSize, sortBy, sortOrder]
  );

  const handlePageSizeChange = useCallback(
    (newSize) => {
      setPageSize(newSize);
      setPage(0);
      router.get(
        route('bills.index'),
        { ...filters, page: 1, per_page: newSize, sort: sortBy, direction: sortOrder },
        { preserveState: true, preserveScroll: true }
      );
    },
    [filters, sortBy, sortOrder]
  );

  const handleSort = useCallback(
    (field, order) => {
      setSortBy(field);
      setSortOrder(order);
      setPage(0);
      router.get(
        route('bills.index'),
        { ...filters, page: 1, per_page: pageSize, sort: field, direction: order },
        { preserveState: true, preserveScroll: true }
      );
    },
    [filters, pageSize]
  );

  const handleFilterChange = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      setPage(0);
      router.get(
        route('bills.index'),
        { ...newFilters, page: 1, per_page: pageSize },
        { preserveState: true, preserveScroll: true }
      );
    },
    [pageSize]
  );

  const handleOpenDrawer = (bill) => {
    setSelectedBill(bill);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedBill(null);
  };

  const handleDelete = (bill) => {
    setBillToDelete(bill);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await router.delete(route('bills.destroy', billToDelete.id));
      toast.success(t('Facture supprimée avec succès'));
      setDeleteDialogOpen(false);
      handleCloseDrawer();
    } catch {
      toast.error(t('Erreur lors de la suppression'));
    }
  };

  const handlePrint = async () => {
    if (selectedBill) {
      window.open(route('bills.print', selectedBill.id), '_blank');
    }
  };

  const handleDownloadPDF = async () => {
    if (selectedBill) {
      window.location.href = route('bills.pdf', selectedBill.id);
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        id: 'number',
        label: t('Numéro'),
        field: 'bill_number',
        sortable: true,
        visible: true,
        alwaysVisible: true,
        render: (value, row) => (
          <Box onClick={() => handleOpenDrawer(row)} sx={{ cursor: 'pointer' }}>
            <Typography variant="body2" fontWeight={500} color="primary">
              {value}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'date',
        label: t('Date'),
        field: 'bill_date',
        sortable: true,
        visible: true,
        render: (value) => (
          <Typography variant="body2">
            {new Date(value).toLocaleDateString(locale)}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: t('Statut'),
        field: 'status',
        sortable: true,
        visible: true,
        render: (value) => <StatusBadge status={value} />,
      },
      {
        id: 'total_items',
        label: t('Articles'),
        field: 'items_count',
        visible: true,
        render: (value) => (
          <Chip label={`${value} ${value === 1 ? t('article') : t('articles')}`} size="small" variant="outlined" />
        ),
      },
      {
        id: 'total_amount',
        label: t('Total'),
        field: 'total_amount',
        sortable: true,
        visible: true,
        render: (value) => (
          <Typography variant="body2" fontWeight={600}>
            {formatCurrency(value)}
          </Typography>
        ),
      },
      {
        id: 'payment_method',
        label: t('Mode de paiement'),
        field: 'payment_method',
        visible: false,
        render: (value) => (
          <Chip
            label={value || '—'}
            size="small"
            color={value === 'cash' ? 'success' : value === 'card' ? 'info' : 'default'}
            variant="outlined"
          />
        ),
      },
      {
        id: 'worker',
        label: t('Vendeur'),
        field: 'worker_id',
        visible: false,
        render: (value, row) => (
          <Typography variant="body2">
            {row.worker?.name || '—'}
          </Typography>
        ),
      },
    ],
    [t, locale]
  );

  const displayColumns = useMemo(() => columns.filter(c => c.visible !== false), [columns]);
  const tableRows = useMemo(() => bills.data || [], [bills.data]);

  return (
    <>
      <Head title={t('Factures')} />

      <PageHeader
        title={t('Factures')}
        subtitle={t('Gérer les factures de vente')}
        breadcrumbs={[{ label: t('Factures'), href: route('bills.index') }]}
        actions={
          <Button
            component={Link}
            href={route('bills.create')}
            variant="contained"
            startIcon={<AddIcon />}
          >
            {t('Nouvelle facture')}
          </Button>
        }
      />

      {/* Main Table */}
      <Box sx={{ mt: 3 }}>
        <ProDataTable
          columns={displayColumns}
          rows={tableRows}
          page={page}
          pageSize={pageSize}
          totalRows={bills.total || 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSort={handleSort}
          onFilterChange={handleFilterChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          filters={filters}
          tableKey="bills"
          enableColumnVisibility
          enableExport
          emptyStateTitle={t('Aucune facture')}
          emptyStateDescription={t('Commencez par créer votre première facture')}
          emptyStateAction={{
            label: t('Créer une facture'),
            onClick: () => router.visit(route('bills.create')),
          }}
        />
      </Box>

      {/* Detail Drawer */}
      <BaseDetailDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        title={selectedBill?.bill_number || ''}
        subtitle={selectedBill ? new Date(selectedBill.bill_date).toLocaleDateString(locale) : ''}
        onEdit={() => router.visit(route('bills.edit', selectedBill.id))}
        onDelete={() => handleDelete(selectedBill)}
        actions={[
          {
            label: t('Imprimer'),
            onClick: handlePrint,
            startIcon: <PrintIcon />,
            variant: 'outlined',
          },
          {
            label: 'PDF',
            onClick: handleDownloadPDF,
            startIcon: <DownloadIcon />,
            variant: 'outlined',
          },
        ]}
      >
        {selectedBill && (
          <>
            {/* Bill Summary */}
            <DetailSection title={t('Résumé')}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <MetricDisplay
                    label={t('Total')}
                    value={formatCurrency(selectedBill.total_amount)}
                    highlighted
                  />
                </Grid>
                <Grid item xs={6}>
                  <MetricDisplay
                    label={t('Nombre d\'articles')}
                    value={selectedBill.items_count || selectedBill.bill_items?.length || 0}
                  />
                </Grid>
              </Grid>
            </DetailSection>

            {/* Line Items */}
            <DetailSection title={t('Articles')}>
              <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>{t('Produit')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {t('Qté')}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {t('Unitaire')}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {t('Total')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedBill.bill_items?.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Typography variant="body2">
                            {item.product?.name || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{item.quantity}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatCurrency(item.unit_price)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={500}>
                            {formatCurrency(item.total_price)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </DetailSection>

            {/* Payment Info */}
            <DetailSection title={t('Paiement')}>
              <DetailRow label={t('Mode')} value={selectedBill.payment_method || '—'} />
              <DetailRow label={t('Statut')} value={<StatusBadge status={selectedBill.status} />} />
              {selectedBill.notes && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <DetailRow label={t('Notes')} value={selectedBill.notes} />
                </>
              )}
            </DetailSection>

            {/* Seller Info */}
            {selectedBill.worker && (
              <DetailSection title={t('Vendeur')}>
                <DetailRow label={t('Nom')} value={selectedBill.worker.name} />
              </DetailSection>
            )}
          </>
        )}
      </BaseDetailDrawer>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title={t('Supprimer la facture')}
        message={t('Êtes-vous sûr de vouloir supprimer cette facture ?')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}
