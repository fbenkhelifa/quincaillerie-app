/**
 * Suppliers/Index - Premium Version
 * =================================
 * Premium supplier management with ProDataTable
 * Detail drawer with contact info and related products
 */

import { useContext, useState, useMemo, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '@/app';
import { PageHeader, ProDataTable } from '@/Components/ui';
import { BaseDetailDrawer, DetailSection, DetailRow, MetricDisplay } from '@/Components/Drawers';
import ConfirmDialog from '@/Components/ConfirmDialog';
import {
  Box,
  Button,
  Avatar,
  Stack,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { getInitials } from '@/utils/premiumUI';

export default function SuppliersIndex({ suppliers, filters: initialFilters }) {
  const { t } = useContext(AppContext);
  const theme = useTheme();

  // State
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  // Table state
  const [page, setPage] = useState((suppliers.current_page || 1) - 1);
  const [pageSize, setPageSize] = useState(suppliers.per_page || 25);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState(initialFilters || {});

  // Handlers
  const handlePageChange = useCallback(
    (newPage) => {
      setPage(newPage);
      router.get(
        route('suppliers.index'),
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
        route('suppliers.index'),
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
        route('suppliers.index'),
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
        route('suppliers.index'),
        { ...newFilters, page: 1, per_page: pageSize },
        { preserveState: true, preserveScroll: true }
      );
    },
    [pageSize]
  );

  const handleOpenDrawer = (supplier) => {
    setSelectedSupplier(supplier);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedSupplier(null);
  };

  const handleDelete = (supplier) => {
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await router.delete(route('suppliers.destroy', supplierToDelete.id));
      toast.success(t('Fournisseur supprimé avec succès'));
      setDeleteDialogOpen(false);
      handleCloseDrawer();
    } catch {
      toast.error(t('Erreur lors de la suppression'));
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        id: 'name',
        label: t('Fournisseur'),
        field: 'name',
        sortable: true,
        visible: true,
        alwaysVisible: true,
        render: (value, row) => (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ backgroundColor: 'primary.main' }}>
              {getInitials(value)}
            </Avatar>
            <Box onClick={() => handleOpenDrawer(row)} sx={{ cursor: 'pointer' }}>
              <Typography variant="body2" fontWeight={500}>
                {value}
              </Typography>
              {row.contact_person && (
                <Typography variant="caption" color="text.secondary">
                  {row.contact_person}
                </Typography>
              )}
            </Box>
          </Stack>
        ),
      },
      {
        id: 'email',
        label: t('Email'),
        field: 'email',
        sortable: true,
        visible: true,
        render: (value) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" component="a" href={`mailto:${value}`} sx={{ textDecoration: 'none', color: 'primary.main' }}>
              {value || '—'}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'phone',
        label: t('Téléphone'),
        field: 'phone',
        visible: true,
        render: (value) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" component="a" href={`tel:${value}`} sx={{ textDecoration: 'none', color: 'primary.main' }}>
              {value || '—'}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'city',
        label: t('Ville'),
        field: 'city',
        visible: false,
        render: (value) => <Typography variant="body2">{value || '—'}</Typography>,
      },
      {
        id: 'country',
        label: t('Pays'),
        field: 'country',
        visible: false,
        render: (value) => <Typography variant="body2">{value || '—'}</Typography>,
      },
      {
        id: 'product_count',
        label: t('Produits'),
        field: 'products_count',
        sortable: false,
        visible: true,
        render: (value) => (
          <Chip
            label={`${value || 0} produit${value !== 1 ? 's' : ''}`}
            size="small"
            variant="outlined"
          />
        ),
      },
    ],
    [t]
  );

  const displayColumns = useMemo(() => columns.filter(c => c.visible !== false), [columns]);
  const tableRows = useMemo(() => suppliers.data || [], [suppliers.data]);

  return (
    <>
      <Head title={t('Fournisseurs')} />

      <PageHeader
        title={t('Fournisseurs')}
        subtitle={t('Gérer vos fournisseurs')}
        breadcrumbs={[{ label: t('Fournisseurs'), href: route('suppliers.index') }]}
        actions={
          <Button
            component={Link}
            href={route('suppliers.create')}
            variant="contained"
            startIcon={<AddIcon />}
          >
            {t('Nouveau fournisseur')}
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
          totalRows={suppliers.total || 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSort={handleSort}
          onFilterChange={handleFilterChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          filters={filters}
          tableKey="suppliers"
          enableColumnVisibility
          enableExport
          enableSearch
          emptyStateTitle={t('Aucun fournisseur')}
          emptyStateDescription={t('Commencez par ajouter votre premier fournisseur')}
          emptyStateAction={{
            label: t('Ajouter un fournisseur'),
            onClick: () => router.visit(route('suppliers.create')),
          }}
        />
      </Box>

      {/* Detail Drawer */}
      <BaseDetailDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        title={selectedSupplier?.name || ''}
        subtitle={selectedSupplier?.contact_person || ''}
        onEdit={() => router.visit(route('suppliers.edit', selectedSupplier.id))}
        onDelete={() => handleDelete(selectedSupplier)}
      >
        {selectedSupplier && (
          <>
            {/* Contact Information */}
            <DetailSection title={t('Contact')}>
              {selectedSupplier.email && (
                <DetailRow
                  label={t('Email')}
                  value={
                    <Box component="a" href={`mailto:${selectedSupplier.email}`} sx={{ color: 'primary.main', textDecoration: 'none' }}>
                      {selectedSupplier.email}
                    </Box>
                  }
                />
              )}
              {selectedSupplier.phone && (
                <DetailRow
                  label={t('Téléphone')}
                  value={
                    <Box component="a" href={`tel:${selectedSupplier.phone}`} sx={{ color: 'primary.main', textDecoration: 'none' }}>
                      {selectedSupplier.phone}
                    </Box>
                  }
                />
              )}
              {selectedSupplier.contact_person && (
                <DetailRow label={t('Personne de contact')} value={selectedSupplier.contact_person} />
              )}
            </DetailSection>

            {/* Address Information */}
            {(selectedSupplier.address || selectedSupplier.city || selectedSupplier.country) && (
              <DetailSection title={t('Adresse')}>
                {selectedSupplier.address && (
                  <DetailRow label={t('Adresse')} value={selectedSupplier.address} />
                )}
                {selectedSupplier.city && <DetailRow label={t('Ville')} value={selectedSupplier.city} />}
                {selectedSupplier.country && (
                  <DetailRow label={t('Pays')} value={selectedSupplier.country} />
                )}
                {selectedSupplier.postal_code && (
                  <DetailRow label={t('Code postal')} value={selectedSupplier.postal_code} />
                )}
              </DetailSection>
            )}

            {/* Statistics */}
            <DetailSection title={t('Statistiques')}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <MetricDisplay
                    label={t('Produits')}
                    value={selectedSupplier.products_count || 0}
                  />
                </Grid>
                <Grid item xs={6}>
                  <MetricDisplay
                    label={t('Commandes')}
                    value={selectedSupplier.purchase_orders_count || 0}
                  />
                </Grid>
              </Grid>
            </DetailSection>

            {/* Products from this Supplier */}
            {selectedSupplier.products && selectedSupplier.products.length > 0 && (
              <DetailSection title={t('Produits fournis')}>
                <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>{t('Produit')}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {t('Qté')}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedSupplier.products.map((product, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Typography variant="body2">{product.name}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">{product.quantity}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </DetailSection>
            )}
          </>
        )}
      </BaseDetailDrawer>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title={t('Supprimer le fournisseur')}
        message={t('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}
