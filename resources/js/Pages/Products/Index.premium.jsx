/**
 * Products/Index - Premium Version
 * ================================
 * Uses ProDataTable for world-class table experience
 * Detail drawer for product information
 * Inline stock adjustment
 */

import { useContext, useState, useMemo, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '@/app';
import { PageHeader, ProDataTable, EmptyState } from '@/Components/ui';
import { BaseDetailDrawer, DetailSection, DetailRow, StatusBadge, MetricDisplay } from '@/Components/Drawers';
import ConfirmDialog from '@/Components/ConfirmDialog';
import {
  Box,
  Button,
  Avatar,
  Chip,
  Stack,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/utils/premiumUI';

export default function ProductsIndex({ products, categories, suppliers, filters: initialFilters }) {
  const { t, locale } = useContext(AppContext);
  const theme = useTheme();
  
  // Drawer state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Stock adjustment dialog
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState({ quantity_change: 1, type: 'adjustment', reason: '' });
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Table state
  const [page, setPage] = useState((products.current_page || 1) - 1);
  const [pageSize, setPageSize] = useState(products.per_page || 25);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState(initialFilters || {});

  // Handlers
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    router.get(
      route('products.index'),
      { ...filters, page: newPage + 1, per_page: pageSize, sort: sortBy, direction: sortOrder },
      { preserveState: true, preserveScroll: true }
    );
  }, [filters, pageSize, sortBy, sortOrder]);

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setPage(0);
    router.get(
      route('products.index'),
      { ...filters, page: 1, per_page: newSize, sort: sortBy, direction: sortOrder },
      { preserveState: true, preserveScroll: true }
    );
  }, [filters, sortBy, sortOrder]);

  const handleSort = useCallback((field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setPage(0);
    router.get(
      route('products.index'),
      { ...filters, page: 1, per_page: pageSize, sort: field, direction: order },
      { preserveState: true, preserveScroll: true }
    );
  }, [filters, pageSize]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(0);
    router.get(
      route('products.index'),
      { ...newFilters, page: 1, per_page: pageSize },
      { preserveState: true, preserveScroll: true }
    );
  }, [pageSize]);

  const handleOpenDrawer = (product) => {
    setSelectedProduct(product);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedProduct(null);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await router.delete(route('products.destroy', productToDelete.id));
      toast.success(t('Produit supprimé avec succès'));
      setDeleteDialogOpen(false);
      handleCloseDrawer();
    } catch {
      toast.error(t('Erreur lors de la suppression'));
    }
  };

  const handleAdjustStock = (product) => {
    setSelectedProduct(product);
    setAdjustmentData({ quantity_change: 1, type: 'adjustment', reason: '' });
    setAdjustDialogOpen(true);
  };

  const confirmAdjustStock = async () => {
    try {
      await router.post(
        route('products.adjust-stock', selectedProduct.id),
        adjustmentData
      );
      toast.success(t('Stock mis à jour avec succès'));
      setAdjustDialogOpen(false);
    } catch {
      toast.error(t('Erreur lors de la mise à jour du stock'));
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        id: 'name',
        label: t('Produit'),
        field: 'name',
        sortable: true,
        visible: true,
        alwaysVisible: true,
        render: (value, row) => (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar
              src={row.image_url}
              alt={value}
              sx={{ width: 40, height: 40, backgroundColor: 'primary.main', cursor: 'pointer' }}
              onClick={() => handleOpenDrawer(row)}
            />
            <Box onClick={() => handleOpenDrawer(row)} sx={{ cursor: 'pointer' }}>
              <Typography variant="body2" fontWeight={500}>
                {value}
              </Typography>
              {row.sku && (
                <Typography variant="caption" color="text.secondary">
                  {row.sku}
                </Typography>
              )}
            </Box>
          </Stack>
        ),
      },
      {
        id: 'category',
        label: t('Catégorie'),
        field: 'category_id',
        sortable: true,
        visible: true,
        render: (value, row) => (
          <Typography variant="body2">
            {row.category?.name || '—'}
          </Typography>
        ),
      },
      {
        id: 'price',
        label: t('Prix'),
        field: 'selling_price',
        sortable: true,
        visible: true,
        render: (value) => (
          <Typography variant="body2" fontWeight={500}>
            {formatCurrency(value)}
          </Typography>
        ),
      },
      {
        id: 'stock',
        label: t('Stock'),
        field: 'quantity',
        sortable: true,
        visible: true,
        render: (value, row) => {
          let status = 'success';
          if (!value || value <= 0) status = 'error';
          else if (value <= row.min_stock) status = 'warning';
          
          return (
            <Chip
              label={`${value} ${row.unit}`}
              color={status}
              variant="outlined"
              size="small"
            />
          );
        },
      },
      {
        id: 'supplier',
        label: t('Fournisseur'),
        field: 'supplier_id',
        visible: false,
        render: (value, row) => (
          <Typography variant="body2">
            {row.supplier?.name || '—'}
          </Typography>
        ),
      },
      {
        id: 'cost',
        label: t('Coût'),
        field: 'cost_price',
        visible: false,
        render: (value) => <Typography variant="body2">{formatCurrency(value)}</Typography>,
      },
      {
        id: 'margin',
        label: t('Marge'),
        field: 'margin',
        visible: false,
        render: (value) => (
          <Typography variant="body2" color="success.main" fontWeight={500}>
            {value ? `${(value * 100).toFixed(1)}%` : '—'}
          </Typography>
        ),
      },
    ],
    [t]
  );

  const displayColumns = useMemo(() => columns.filter(c => c.visible !== false), [columns]);

  const tableRows = useMemo(() => products.data || [], [products.data]);

  return (
    <>
      <Head title={t('Produits')} />

      <PageHeader
        title={t('Produits')}
        subtitle={t('Gérer l\'inventaire des produits')}
        breadcrumbs={[{ label: t('Produits'), href: route('products.index') }]}
        actions={
          <Button
            component={Link}
            href={route('products.create')}
            variant="contained"
            startIcon={<AddIcon />}
          >
            {t('Nouveau produit')}
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
          totalRows={products.total || 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSort={handleSort}
          onFilterChange={handleFilterChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          filters={filters}
          tableKey="products"
          enableColumnVisibility
          enableExport
          emptyStateTitle={t('Aucun produit')}
          emptyStateDescription={t('Commencez par ajouter votre premier produit')}
          emptyStateAction={{
            label: t('Ajouter un produit'),
            onClick: () => router.visit(route('products.create')),
          }}
        />
      </Box>

      {/* Detail Drawer */}
      <BaseDetailDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        title={selectedProduct?.name || ''}
        subtitle={selectedProduct?.sku || ''}
        onEdit={() => router.visit(route('products.edit', selectedProduct.id))}
        onDelete={() => handleDelete(selectedProduct)}
        actions={[
          {
            label: t('Ajouter stock'),
            onClick: () => handleAdjustStock(selectedProduct),
            startIcon: <AddCircleIcon />,
            variant: 'outlined',
          },
        ]}
      >
        {selectedProduct && (
          <>
            {/* Price & Margins */}
            <DetailSection title={t('Tarification')}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <MetricDisplay
                    label={t('Prix de vente')}
                    value={formatCurrency(selectedProduct.selling_price)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <MetricDisplay
                    label={t('Coût d\'achat')}
                    value={formatCurrency(selectedProduct.cost_price)}
                  />
                </Grid>
              </Grid>
              {selectedProduct.margin && (
                <Box sx={{ mt: 2 }}>
                  <DetailRow
                    label={t('Marge brute')}
                    value={`${(selectedProduct.margin * 100).toFixed(1)}%`}
                    highlight
                  />
                </Box>
              )}
            </DetailSection>

            {/* Stock Status */}
            <DetailSection title={t('Stock')}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <MetricDisplay
                    label={t('Stock actuel')}
                    value={selectedProduct.quantity}
                    unit={selectedProduct.unit}
                    highlighted
                  />
                </Grid>
                <Grid item xs={6}>
                  <MetricDisplay
                    label={t('Stock minimum')}
                    value={selectedProduct.min_stock}
                    unit={selectedProduct.unit}
                  />
                </Grid>
              </Grid>
              <Box>
                <StatusBadge
                  status={
                    !selectedProduct.quantity || selectedProduct.quantity <= 0
                      ? 'out_of_stock'
                      : selectedProduct.quantity <= selectedProduct.min_stock
                      ? 'low_stock'
                      : 'in_stock'
                  }
                />
              </Box>
            </DetailSection>

            {/* Category & Supplier */}
            <DetailSection title={t('Information')}>
              <DetailRow
                label={t('Catégorie')}
                value={selectedProduct.category?.name || '—'}
              />
              <DetailRow
                label={t('Fournisseur')}
                value={selectedProduct.supplier?.name || '—'}
              />
              <DetailRow label={t('Unité')} value={selectedProduct.unit} />
            </DetailSection>

            {/* Description */}
            {selectedProduct.description && (
              <DetailSection title={t('Description')}>
                <Typography variant="body2" color="text.secondary">
                  {selectedProduct.description}
                </Typography>
              </DetailSection>
            )}
          </>
        )}
      </BaseDetailDrawer>

      {/* Stock Adjustment Dialog */}
      <Dialog open={adjustDialogOpen} onClose={() => setAdjustDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('Ajuster le stock')}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {t('Produit')}: {selectedProduct?.name}
            </Typography>
            <TextField
              label={t('Quantité')}
              type="number"
              value={adjustmentData.quantity_change}
              onChange={(e) =>
                setAdjustmentData({
                  ...adjustmentData,
                  quantity_change: parseInt(e.target.value),
                })
              }
              fullWidth
              inputProps={{ min: 1 }}
            />
            <FormControl fullWidth>
              <InputLabel>{t('Type')}</InputLabel>
              <Select
                value={adjustmentData.type}
                label={t('Type')}
                onChange={(e) =>
                  setAdjustmentData({ ...adjustmentData, type: e.target.value })
                }
              >
                <MenuItem value="adjustment">{t('Ajustement')}</MenuItem>
                <MenuItem value="receipt">{t('Réception')}</MenuItem>
                <MenuItem value="inventory">{t('Inventaire')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={t('Raison')}
              multiline
              rows={2}
              value={adjustmentData.reason}
              onChange={(e) =>
                setAdjustmentData({ ...adjustmentData, reason: e.target.value })
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjustDialogOpen(false)}>{t('Annuler')}</Button>
          <Button onClick={confirmAdjustStock} variant="contained">
            {t('Confirmer')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title={t('Supprimer le produit')}
        message={t('Êtes-vous sûr de vouloir supprimer ce produit ?')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}
