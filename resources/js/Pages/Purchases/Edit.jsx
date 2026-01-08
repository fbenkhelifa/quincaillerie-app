import { useContext, useState, useMemo } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../../app';
import {
    Box,
    Button,
    TextField,
    Grid,
    Paper,
    Typography,
    Divider,
    Autocomplete,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    ArrowBack as BackIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function PurchasesEdit({ order, suppliers, products }) {
    const { t, locale } = useContext(AppContext);
    
    const [selectedSupplier, setSelectedSupplier] = useState(
        suppliers.find(s => s.id === order.supplier_id) || null
    );

    const { data, setData, put, processing, errors } = useForm({
        supplier_id: order.supplier_id || '',
        order_date: order.order_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        expected_date: order.expected_date?.split('T')[0] || '',
        tax: order.tax || 0,
        shipping: order.shipping || 0,
        notes: order.notes || '',
        supplier_notes: order.supplier_notes || '',
        items: order.items?.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name,
            product_sku: item.product_sku,
            quantity_ordered: item.quantity_ordered,
            unit: item.unit,
            unit_cost: item.unit_cost,
        })) || [],
    });

    const formatCurrency = (value) => {
        return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
            minimumFractionDigits: 2,
        }).format(value) + ' DA';
    };

    const subtotal = useMemo(() => {
        return data.items.reduce((sum, item) => sum + (item.quantity_ordered * item.unit_cost), 0);
    }, [data.items]);

    const total = useMemo(() => {
        return subtotal + parseFloat(data.tax || 0) + parseFloat(data.shipping || 0);
    }, [subtotal, data.tax, data.shipping]);

    const handleSupplierChange = (supplier) => {
        setSelectedSupplier(supplier);
        setData('supplier_id', supplier?.id || '');
    };

    const addItem = (product) => {
        if (!product) return;
        
        if (data.items.find(item => item.product_id === product.id)) {
            toast.error(t('Ce produit est déjà dans la commande'));
            return;
        }

        const newItem = {
            product_id: product.id,
            product_name: product.name,
            product_sku: product.sku,
            quantity_ordered: 1,
            unit: product.unit || 'unité',
            unit_cost: product.purchase_price || 0,
        };

        setData('items', [...data.items, newItem]);
    };

    const updateItem = (index, field, value) => {
        const updated = [...data.items];
        updated[index] = { ...updated[index], [field]: value };
        setData('items', updated);
    };

    const removeItem = (index) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (data.items.length === 0) {
            toast.error(t('Ajoutez au moins un article'));
            return;
        }

        put(route('purchases.update', order.id), {
            onSuccess: () => {
                toast.success(t('Commande mise à jour'));
            },
            onError: () => {
                toast.error(t('Erreur lors de la mise à jour'));
            },
        });
    };

    return (
        <Layout>
            <Head title={`${t('Modifier')} ${order.po_number}`} />

            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                    <IconButton onClick={() => router.visit(route('purchases.show', order.id))}>
                        <BackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            {t('Modifier la commande')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {order.po_number}
                        </Typography>
                    </Box>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Left Column - Order Details */}
                        <Grid item xs={12} md={8}>
                            {/* Supplier & Dates */}
                            <Paper sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    {t('Informations de commande')}
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Autocomplete
                                            options={suppliers}
                                            getOptionLabel={(option) => option.name}
                                            value={selectedSupplier}
                                            onChange={(_, value) => handleSupplierChange(value)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={t('Fournisseur')}
                                                    required
                                                    error={!!errors.supplier_id}
                                                    helperText={errors.supplier_id}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            label={t('Date de commande')}
                                            type="date"
                                            value={data.order_date}
                                            onChange={(e) => setData('order_date', e.target.value)}
                                            fullWidth
                                            required
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            label={t('Date prévue')}
                                            type="date"
                                            value={data.expected_date}
                                            onChange={(e) => setData('expected_date', e.target.value)}
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Products */}
                            <Paper sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">
                                        {t('Articles')}
                                    </Typography>
                                    <Autocomplete
                                        options={products}
                                        getOptionLabel={(option) => `${option.name} (${option.sku})`}
                                        onChange={(_, value) => addItem(value)}
                                        value={null}
                                        sx={{ width: 300 }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={t('Ajouter un produit')}
                                                size="small"
                                            />
                                        )}
                                    />
                                </Box>

                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>{t('Produit')}</TableCell>
                                                <TableCell align="center" sx={{ width: 100 }}>{t('Quantité')}</TableCell>
                                                <TableCell align="center" sx={{ width: 80 }}>{t('Unité')}</TableCell>
                                                <TableCell align="right" sx={{ width: 130 }}>{t('Prix unitaire')}</TableCell>
                                                <TableCell align="right" sx={{ width: 130 }}>{t('Total')}</TableCell>
                                                <TableCell sx={{ width: 60 }}></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {data.items.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                        <Typography color="text.secondary">
                                                            {t('Aucun article')}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                data.items.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {item.product_name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {item.product_sku}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <TextField
                                                                type="number"
                                                                size="small"
                                                                value={item.quantity_ordered}
                                                                onChange={(e) => updateItem(index, 'quantity_ordered', parseFloat(e.target.value) || 0)}
                                                                inputProps={{ min: 0.01, step: 0.01 }}
                                                                sx={{ width: 80 }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Typography variant="body2">{item.unit}</Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <TextField
                                                                type="number"
                                                                size="small"
                                                                value={item.unit_cost}
                                                                onChange={(e) => updateItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                                                                inputProps={{ min: 0, step: 0.01 }}
                                                                sx={{ width: 100 }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography fontWeight={500}>
                                                                {formatCurrency(item.quantity_ordered * item.unit_cost)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => removeItem(index)}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>

                        {/* Right Column - Summary */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
                                <Typography variant="h6" gutterBottom>
                                    {t('Récapitulatif')}
                                </Typography>

                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography color="text.secondary">{t('Sous-total')}</Typography>
                                        <Typography>{formatCurrency(subtotal)}</Typography>
                                    </Box>
                                    
                                    <TextField
                                        label={t('Taxes')}
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={data.tax}
                                        onChange={(e) => setData('tax', parseFloat(e.target.value) || 0)}
                                        sx={{ mb: 1 }}
                                    />
                                    
                                    <TextField
                                        label={t('Frais de livraison')}
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={data.shipping}
                                        onChange={(e) => setData('shipping', parseFloat(e.target.value) || 0)}
                                        sx={{ mb: 2 }}
                                    />

                                    <Divider sx={{ my: 2 }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="h6">{t('Total')}</Typography>
                                        <Typography variant="h6" color="primary">
                                            {formatCurrency(total)}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <TextField
                                    label={t('Notes internes')}
                                    multiline
                                    rows={2}
                                    fullWidth
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    label={t('Notes fournisseur')}
                                    multiline
                                    rows={2}
                                    fullWidth
                                    value={data.supplier_notes}
                                    onChange={(e) => setData('supplier_notes', e.target.value)}
                                    sx={{ mb: 3 }}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    startIcon={<SaveIcon />}
                                    disabled={processing}
                                >
                                    {t('Enregistrer les modifications')}
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Layout>
    );
}
