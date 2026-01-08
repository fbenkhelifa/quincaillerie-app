import { useContext, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../../app';
import ProductsTable from '@/Components/ProductsTable';
import Filters from '@/Components/Filters';
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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function ProductsIndex({ products, categories, suppliers, filters }) {
    const { t } = useContext(AppContext);
    const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [adjustmentData, setAdjustmentData] = useState({
        quantity_change: 1,
        type: 'adjustment',
        reason: '',
    });

    const handleDelete = (productId) => {
        router.delete(route('products.destroy', productId), {
            onSuccess: () => toast.success(t('Produit supprimé avec succès')),
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

    return (
        <Layout
            title={t('Produits')}
            breadcrumbs={[{ label: t('Produits') }]}
        >
            <Head title={t('Produits')} />

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">
                    {t('Gestion des produits')}
                </Typography>
                <Button
                    component={Link}
                    href={route('products.create')}
                    variant="contained"
                    startIcon={<AddIcon />}
                >
                    {t('Nouveau produit')}
                </Button>
            </Box>

            <Filters
                filters={filters}
                categories={categories}
                suppliers={suppliers}
                route="products.index"
            />

            <ProductsTable
                products={products}
                onDelete={handleDelete}
                onAdjustStock={handleAdjustStock}
            />

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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            {t('Stock actuel')}: {selectedProduct?.quantity} {selectedProduct?.unit}
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
                <DialogActions>
                    <Button onClick={() => setAdjustDialogOpen(false)} color="inherit">
                        {t('Annuler')}
                    </Button>
                    <Button onClick={confirmAdjustStock} variant="contained">
                        {t('Confirmer')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}
