import { useContext, useState, useEffect, useCallback } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../../app';
import {
    Box,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    InputAdornment,
    Autocomplete,
    Divider,
    Checkbox,
    Chip,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Print as PrintIcon,
    ArrowBack as BackIcon,
    CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
    CheckBox as CheckBoxIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';

export default function BillsCreate({ workers, storeSettings }) {
    const { t, locale } = useContext(AppContext);
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const { data, setData, post, processing, errors } = useForm({
        worker_id: '',
        customer_name: '',
        customer_phone: '',
        discount: 0,
        tax: 0,
        payment_method: 'cash',
        notes: '',
        items: [],
    });

    const searchProducts = useCallback(
        debounce(async (query) => {
            if (!query || query.length < 2) {
                setSearchResults([]);
                return;
            }
            
            setLoading(true);
            try {
                const response = await fetch(route('products.search') + `?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    useEffect(() => {
        searchProducts(searchQuery);
    }, [searchQuery, searchProducts]);

    const addProduct = (product) => {
        const existingIndex = data.items.findIndex((item) => item.product_id === product.id);
        
        if (existingIndex >= 0) {
            const newItems = [...data.items];
            newItems[existingIndex].quantity += 1;
            setData('items', newItems);
        } else {
            setData('items', [
                ...data.items,
                {
                    product_id: product.id,
                    product_name: product.name,
                    product_sku: product.sku,
                    quantity: 1,
                    unit: product.unit,
                    unit_price: parseFloat(product.selling_price),
                    discount: 0,
                    available_stock: parseFloat(product.quantity),
                },
            ]);
        }
        
        setSearchQuery('');
        setSearchResults([]);
    };

    const addMultipleProducts = (products) => {
        const newItems = [...data.items];
        
        products.forEach((product) => {
            const existingIndex = newItems.findIndex((item) => item.product_id === product.id);
            
            if (existingIndex >= 0) {
                newItems[existingIndex].quantity += 1;
            } else {
                newItems.push({
                    product_id: product.id,
                    product_name: product.name,
                    product_sku: product.sku,
                    quantity: 1,
                    unit: product.unit,
                    unit_price: parseFloat(product.selling_price),
                    discount: 0,
                    available_stock: parseFloat(product.quantity),
                });
            }
        });
        
        setData('items', newItems);
        setSelectedProducts([]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        setData('items', newItems);
    };

    const removeItem = (index) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const calculateSubtotal = () => {
        return data.items.reduce((total, item) => {
            return total + (item.quantity * item.unit_price) - (item.discount || 0);
        }, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        return subtotal - (parseFloat(data.discount) || 0) + (parseFloat(data.tax) || 0);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value) + ' DA';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (data.items.length === 0) {
            toast.error(t('Veuillez ajouter au moins un produit'));
            return;
        }

        // Check stock availability
        for (const item of data.items) {
            if (item.quantity > item.available_stock) {
                toast.error(t('Stock insuffisant pour') + ' ' + item.product_name);
                return;
            }
        }

        post(route('bills.store'), {
            onSuccess: () => toast.success(t('Facture créée avec succès')),
            onError: (errors) => {
                if (errors.error) {
                    toast.error(errors.error);
                } else {
                    toast.error(t('Erreur lors de la création de la facture'));
                }
            },
        });
    };

    const paymentMethods = [
        { value: 'cash', label: t('Espèces') },
        { value: 'card', label: t('Carte bancaire') },
        { value: 'check', label: t('Chèque') },
        { value: 'credit', label: t('Crédit') },
        { value: 'other', label: t('Autre') },
    ];

    return (
        <Layout
            title={t('Nouvelle facture')}
            breadcrumbs={[
                { label: t('Factures'), href: route('bills.index') },
                { label: t('Nouvelle') },
            ]}
        >
            <Head title={t('Nouvelle facture')} />

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">
                    {t('Nouvelle facture')}
                </Typography>
                <Button
                    onClick={() => router.get(route('bills.index'))}
                    startIcon={<BackIcon />}
                >
                    {t('Retour')}
                </Button>
            </Box>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* Customer & Bill Info */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                {t('Informations client')}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    label={t('Nom du client')}
                                    value={data.customer_name}
                                    onChange={(e) => setData('customer_name', e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    label={t('Téléphone')}
                                    value={data.customer_phone}
                                    onChange={(e) => setData('customer_phone', e.target.value)}
                                    fullWidth
                                />
                                <FormControl fullWidth>
                                    <InputLabel>{t('Vendeur')}</InputLabel>
                                    <Select
                                        value={data.worker_id}
                                        onChange={(e) => setData('worker_id', e.target.value)}
                                        label={t('Vendeur')}
                                    >
                                        <MenuItem value="">{t('Sélectionner')}</MenuItem>
                                        {workers.map((worker) => (
                                            <MenuItem key={worker.id} value={worker.id}>
                                                {worker.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth>
                                    <InputLabel>{t('Mode de paiement')}</InputLabel>
                                    <Select
                                        value={data.payment_method}
                                        onChange={(e) => setData('payment_method', e.target.value)}
                                        label={t('Mode de paiement')}
                                    >
                                        {paymentMethods.map((pm) => (
                                            <MenuItem key={pm.value} value={pm.value}>
                                                {pm.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    label={t('Notes')}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    multiline
                                    rows={2}
                                    fullWidth
                                />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Products */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                {t('Produits')}
                            </Typography>

                            {/* Product Search - Multi-Select */}
                            <Autocomplete
                                multiple
                                disableCloseOnSelect
                                options={searchResults}
                                getOptionLabel={(option) => 
                                    typeof option === 'string' ? option : `${option.name} (${option.sku || option.barcode || ''})`
                                }
                                value={selectedProducts}
                                inputValue={searchQuery}
                                onInputChange={(e, value, reason) => {
                                    if (reason !== 'reset') {
                                        setSearchQuery(value);
                                    }
                                }}
                                onChange={(e, value) => {
                                    setSelectedProducts(value);
                                }}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                loading={loading}
                                renderOption={(props, option, { selected }) => {
                                    const { key, ...otherProps } = props;
                                    return (
                                        <Box component="li" key={key} {...otherProps}>
                                            <Checkbox
                                                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                                                checkedIcon={<CheckBoxIcon fontSize="small" />}
                                                style={{ marginRight: 8 }}
                                                checked={selected}
                                            />
                                            <Box>
                                                <Typography variant="body2">{option.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {option.sku} • {formatCurrency(option.selling_price)} • Stock: {option.quantity} {option.unit}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    );
                                }}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => {
                                        const { key, ...tagProps } = getTagProps({ index });
                                        return (
                                            <Chip
                                                key={key}
                                                label={option.name}
                                                size="small"
                                                {...tagProps}
                                            />
                                        );
                                    })
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={t('Rechercher des produits (nom, code-barres, SKU)')}
                                        placeholder={t('Taper pour rechercher...')}
                                        fullWidth
                                    />
                                )}
                            />
                            
                            {/* Add Selected Products Button */}
                            {selectedProducts.length > 0 && (
                                <Box sx={{ mt: 1, mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={() => addMultipleProducts(selectedProducts)}
                                    >
                                        {t('Ajouter')} {selectedProducts.length} {t('produit(s)')}
                                    </Button>
                                </Box>
                            )}

                            {selectedProducts.length === 0 && <Box sx={{ mb: 2 }} />}

                            {/* Items Table */}
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>{t('Produit')}</TableCell>
                                            <TableCell align="center">{t('Qté')}</TableCell>
                                            <TableCell align="right">{t('Prix unit.')}</TableCell>
                                            <TableCell align="right">{t('Remise')}</TableCell>
                                            <TableCell align="right">{t('Total')}</TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.items.length > 0 ? (
                                            data.items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Typography variant="body2">{item.product_name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Stock: {item.available_stock} {item.unit}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <TextField
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                                                            size="small"
                                                            inputProps={{ min: 1, step: 1 }}
                                                            sx={{ width: 80 }}
                                                            inputProps={{ min: 0.01, step: 0.01 }}
                                                            error={item.quantity > item.available_stock}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <TextField
                                                            type="number"
                                                            value={item.unit_price}
                                                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                            size="small"
                                                            sx={{ width: 100 }}
                                                            InputProps={{
                                                                endAdornment: <InputAdornment position="end">DA</InputAdornment>,
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <TextField
                                                            type="number"
                                                            value={item.discount}
                                                            onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                                                            size="small"
                                                            sx={{ width: 80 }}
                                                            InputProps={{
                                                                endAdornment: <InputAdornment position="end">DA</InputAdornment>,
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {formatCurrency((item.quantity * item.unit_price) - (item.discount || 0))}
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => removeItem(index)}
                                                            color="error"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">
                                                    <Typography color="text.secondary">
                                                        {t('Aucun produit ajouté')}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Divider sx={{ my: 2 }} />

                            {/* Totals */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Box sx={{ width: 300 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography>{t('Sous-total')}:</Typography>
                                        <Typography fontWeight="medium">
                                            {formatCurrency(calculateSubtotal())}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Typography>{t('Remise globale')}:</Typography>
                                        <TextField
                                            type="number"
                                            value={data.discount}
                                            onChange={(e) => setData('discount', e.target.value)}
                                            size="small"
                                            sx={{ width: 100 }}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">DA</InputAdornment>,
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Typography>{t('Taxe')}:</Typography>
                                        <TextField
                                            type="number"
                                            value={data.tax}
                                            onChange={(e) => setData('tax', e.target.value)}
                                            size="small"
                                            sx={{ width: 100 }}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">DA</InputAdornment>,
                                            }}
                                        />
                                    </Box>
                                    <Divider sx={{ mb: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="h6">{t('Total')}:</Typography>
                                        <Typography variant="h6" color="primary" fontWeight="bold">
                                            {formatCurrency(calculateTotal())}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Actions */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                                <Button
                                    onClick={() => router.get(route('bills.index'))}
                                    disabled={processing}
                                >
                                    {t('Annuler')}
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    disabled={processing || data.items.length === 0}
                                >
                                    {t('Créer la facture')}
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </form>
        </Layout>
    );
}
