import { useContext, useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../../app';
import { useBarcodeScanner, usePOSKeyboardShortcuts, usePOSCart, POSSounds } from '@/hooks/usePOS';
import { BarcodeInput, KeyboardShortcutsPanel, ScanFeedback, CartFilters } from '@/Components/pos';
import { POSCartTable } from '@/Components/pos';
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
    Divider,
    Checkbox,
    Chip,
    Switch,
    FormControlLabel,
    Autocomplete,
    InputAdornment,
    alpha,
    Collapse,
    Tooltip,
    IconButton,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Print as PrintIcon,
    ArrowBack as BackIcon,
    CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
    CheckBox as CheckBoxIcon,
    PointOfSale as POSIcon,
    ShoppingCart as CartIcon,
    Person as PersonIcon,
    Payment as PaymentIcon,
    Clear as ClearIcon,
    ExpandMore as ExpandIcon,
    ExpandLess as CollapseIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';

export default function BillsCreate({ workers, storeSettings }) {
    const { t, locale } = useContext(AppContext);
    
    // POS Mode state
    const [isPOSMode, setIsPOSMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('pos_mode') === 'true';
        }
        return true;
    });
    const [showCustomerPanel, setShowCustomerPanel] = useState(false);
    const [cartFilter, setCartFilter] = useState('all');
    const [scanFeedback, setScanFeedback] = useState({ show: false, type: '', message: '' });

    // Legacy search state (for non-POS mode)
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Form data
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

    // POS Cart hook
    const {
        items: cartItems,
        setItems: setCartItems,
        selectedIndex,
        setSelectedIndex,
        addProduct,
        updateItem,
        incrementQuantity,
        decrementQuantity,
        removeItem,
        clearCart,
        subtotal,
        duplicateProducts,
        lowStockItems,
    } = usePOSCart([]);

    // Sync cart items with form data
    useEffect(() => {
        setData('items', cartItems);
    }, [cartItems]);

    // Save POS mode preference
    useEffect(() => {
        localStorage.setItem('pos_mode', isPOSMode.toString());
    }, [isPOSMode]);

    // Show scan feedback
    const showFeedback = useCallback((type, message) => {
        setScanFeedback({ show: true, type, message });
        setTimeout(() => setScanFeedback({ show: false, type: '', message: '' }), 1000);
    }, []);

    // Handle product scan/add
    const handleScan = useCallback(
        (product) => {
            addProduct(product);
            showFeedback('success', `+ ${product.name}`);
        },
        [addProduct, showFeedback]
    );

    // Handle scan error
    const handleScanError = useCallback(
        (message) => {
            showFeedback('error', message);
            toast.error(message);
        },
        [showFeedback]
    );

    // Barcode scanner hook
    const {
        inputValue,
        inputRef,
        isLoading: barcodeLoading,
        searchResults: barcodeResults,
        showDropdown,
        handleInputChange,
        handleKeyDown,
        selectProduct,
        focusInput,
        clearInput,
        setShowDropdown,
    } = useBarcodeScanner({
        onScan: handleScan,
        onError: handleScanError,
        enabled: isPOSMode,
    });

    // Handle finalize
    const handleFinalize = useCallback(() => {
        if (cartItems.length === 0) {
            toast.error(t('Veuillez ajouter au moins un produit'));
            return;
        }

        // Check stock availability
        for (const item of cartItems) {
            if (item.quantity > item.available_stock) {
                toast.error(t('Stock insuffisant pour') + ' ' + item.product_name);
                return;
            }
        }

        POSSounds.finalize();
        post(route('bills.store'), {
            onSuccess: () => {
                toast.success(t('Facture créée avec succès'));
                clearCart();
            },
            onError: (errors) => {
                if (errors.error) {
                    toast.error(errors.error);
                } else {
                    toast.error(t('Erreur lors de la création de la facture'));
                }
            },
        });
    }, [cartItems, t, post, clearCart]);

    // Keyboard shortcuts
    usePOSKeyboardShortcuts({
        onFocusSearch: focusInput,
        onFinalize: handleFinalize,
        onIncrement: incrementQuantity,
        onDecrement: decrementQuantity,
        onDelete: removeItem,
        enabled: isPOSMode,
        selectedIndex,
    });

    // Legacy search for non-POS mode
    const searchProducts = useMemo(
        () =>
            debounce(async (query) => {
                if (!query || query.length < 2) {
                    setSearchResults([]);
                    return;
                }

                setLoading(true);
                try {
                    const response = await fetch(route('products.search') + `?q=${encodeURIComponent(query)}`);
                    const results = await response.json();
                    setSearchResults(results);
                } catch (error) {
                    console.error('Search error:', error);
                } finally {
                    setLoading(false);
                }
            }, 300),
        []
    );

    useEffect(() => {
        if (!isPOSMode) {
            searchProducts(searchQuery);
        }
    }, [searchQuery, searchProducts, isPOSMode]);

    // Legacy add product (for non-POS mode)
    const addProductLegacy = (product) => {
        addProduct(product);
        setSearchQuery('');
        setSearchResults([]);
    };

    const addMultipleProducts = (products) => {
        products.forEach((product) => addProduct(product));
        setSelectedProducts([]);
        setSearchQuery('');
        setSearchResults([]);
    };

    // Calculate total
    const calculateTotal = () => {
        return subtotal - (parseFloat(data.discount) || 0) + (parseFloat(data.tax) || 0);
    };

    // Format currency
    const formatCurrency = useCallback(
        (value) => {
            return (
                new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(value) + ' DA'
            );
        },
        [locale]
    );

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

            {/* Scan Feedback Overlay */}
            <ScanFeedback {...scanFeedback} />

            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        onClick={() => router.get(route('bills.index'))}
                        startIcon={<BackIcon />}
                        color="inherit"
                    >
                        {t('Retour')}
                    </Button>
                </Box>
                
                {/* POS Mode Toggle */}
                <FormControlLabel
                    control={
                        <Switch
                            checked={isPOSMode}
                            onChange={(e) => setIsPOSMode(e.target.checked)}
                            color="primary"
                        />
                    }
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <POSIcon />
                            <Typography fontWeight={isPOSMode ? 600 : 400}>
                                {t('Mode POS')}
                            </Typography>
                        </Box>
                    }
                />
            </Box>

            {/* POS Mode Layout */}
            {isPOSMode ? (
                <Grid container spacing={2}>
                    {/* Left Panel - Cart */}
                    <Grid item xs={12} lg={8}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                            {/* Barcode Input */}
                            <Box sx={{ mb: 2 }}>
                                <BarcodeInput
                                    value={inputValue}
                                    inputRef={inputRef}
                                    isLoading={barcodeLoading}
                                    searchResults={barcodeResults}
                                    showDropdown={showDropdown}
                                    onInputChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    onSelectProduct={selectProduct}
                                    onClear={clearInput}
                                    onCloseDropdown={() => setShowDropdown(false)}
                                    formatCurrency={formatCurrency}
                                    t={t}
                                />
                            </Box>

                            {/* Keyboard Shortcuts */}
                            <Box sx={{ mb: 2 }}>
                                <KeyboardShortcutsPanel t={t} />
                            </Box>

                            {/* Cart Filters */}
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <CartFilters
                                    activeFilter={cartFilter}
                                    onFilterChange={setCartFilter}
                                    duplicateCount={duplicateProducts.length}
                                    lowStockCount={lowStockItems.length}
                                    t={t}
                                />
                                {cartItems.length > 0 && (
                                    <Button
                                        size="small"
                                        color="error"
                                        startIcon={<ClearIcon />}
                                        onClick={clearCart}
                                    >
                                        {t('Vider')}
                                    </Button>
                                )}
                            </Box>

                            {/* Cart Table */}
                            <POSCartTable
                                items={cartItems}
                                selectedIndex={selectedIndex}
                                duplicateProducts={duplicateProducts}
                                filter={cartFilter}
                                onSelect={setSelectedIndex}
                                onIncrement={incrementQuantity}
                                onDecrement={decrementQuantity}
                                onRemove={removeItem}
                                onUpdatePrice={(index, value) => updateItem(index, 'unit_price', value)}
                                onUpdateDiscount={(index, value) => updateItem(index, 'discount', value)}
                                formatCurrency={formatCurrency}
                                t={t}
                            />
                        </Paper>
                    </Grid>

                    {/* Right Panel - Summary & Actions */}
                    <Grid item xs={12} lg={4}>
                        {/* Customer Info (Collapsible) */}
                        <Paper sx={{ p: 2, mb: 2 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                }}
                                onClick={() => setShowCustomerPanel(!showCustomerPanel)}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon color="primary" />
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {t('Client')}
                                    </Typography>
                                    {data.customer_name && (
                                        <Chip label={data.customer_name} size="small" />
                                    )}
                                </Box>
                                <IconButton size="small">
                                    {showCustomerPanel ? <CollapseIcon /> : <ExpandIcon />}
                                </IconButton>
                            </Box>
                            <Collapse in={showCustomerPanel}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                    <TextField
                                        label={t('Nom du client')}
                                        value={data.customer_name}
                                        onChange={(e) => setData('customer_name', e.target.value)}
                                        fullWidth
                                        size="small"
                                    />
                                    <TextField
                                        label={t('Téléphone')}
                                        value={data.customer_phone}
                                        onChange={(e) => setData('customer_phone', e.target.value)}
                                        fullWidth
                                        size="small"
                                    />
                                    <FormControl fullWidth size="small">
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
                                    <TextField
                                        label={t('Notes')}
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        multiline
                                        rows={2}
                                        fullWidth
                                        size="small"
                                    />
                                </Box>
                            </Collapse>
                        </Paper>

                        {/* Payment */}
                        <Paper sx={{ p: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <PaymentIcon color="primary" />
                                <Typography variant="subtitle1" fontWeight={600}>
                                    {t('Paiement')}
                                </Typography>
                            </Box>
                            
                            {/* Payment Method - Large Touch Buttons */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 2 }}>
                                {paymentMethods.slice(0, 4).map((pm) => (
                                    <Button
                                        key={pm.value}
                                        variant={data.payment_method === pm.value ? 'contained' : 'outlined'}
                                        onClick={() => setData('payment_method', pm.value)}
                                        sx={{
                                            py: 1.5,
                                            fontWeight: data.payment_method === pm.value ? 600 : 400,
                                        }}
                                    >
                                        {pm.label}
                                    </Button>
                                ))}
                            </Box>

                            {/* Discount & Tax */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                <TextField
                                    label={t('Remise')}
                                    type="number"
                                    value={data.discount}
                                    onChange={(e) => setData('discount', e.target.value)}
                                    size="small"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">DA</InputAdornment>,
                                    }}
                                />
                                <TextField
                                    label={t('Taxe')}
                                    type="number"
                                    value={data.tax}
                                    onChange={(e) => setData('tax', e.target.value)}
                                    size="small"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">DA</InputAdornment>,
                                    }}
                                />
                            </Box>
                        </Paper>

                        {/* Summary */}
                        <Paper
                            sx={{
                                p: 2,
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                                border: '2px solid',
                                borderColor: 'primary.main',
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography color="text.secondary">{t('Sous-total')}</Typography>
                                <Typography fontWeight={500}>{formatCurrency(subtotal)}</Typography>
                            </Box>
                            {parseFloat(data.discount) > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography color="error.main">{t('Remise')}</Typography>
                                    <Typography color="error.main">-{formatCurrency(data.discount)}</Typography>
                                </Box>
                            )}
                            {parseFloat(data.tax) > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography color="text.secondary">{t('Taxe')}</Typography>
                                    <Typography>+{formatCurrency(data.tax)}</Typography>
                                </Box>
                            )}
                            <Divider sx={{ my: 1.5 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">{t('Total')}</Typography>
                                <Typography variant="h4" color="primary.main" fontWeight={700}>
                                    {formatCurrency(calculateTotal())}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                                <CartIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                    {cartItems.length} {t('article(s)')}
                                </Typography>
                            </Box>
                        </Paper>

                        {/* Action Buttons */}
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                startIcon={<SaveIcon />}
                                onClick={handleFinalize}
                                disabled={processing || cartItems.length === 0}
                                sx={{
                                    py: 2,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                }}
                            >
                                {t('Finaliser')} (Ctrl+Enter)
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                fullWidth
                                onClick={() => router.get(route('bills.index'))}
                                disabled={processing}
                            >
                                {t('Annuler')}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            ) : (
                /* Legacy Mode - Original Layout */
                <form onSubmit={(e) => { e.preventDefault(); handleFinalize(); }}>
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
                                        typeof option === 'string'
                                            ? option
                                            : `${option.name} (${option.sku || option.barcode || ''})`
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
                                                        {option.sku} • {formatCurrency(option.selling_price)} • Stock:{' '}
                                                        {option.quantity} {option.unit}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        );
                                    }}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => {
                                            const { key, ...tagProps } = getTagProps({ index });
                                            return <Chip key={key} label={option.name} size="small" {...tagProps} />;
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

                                {/* Cart Table (using POS table for consistency) */}
                                <POSCartTable
                                    items={cartItems}
                                    selectedIndex={selectedIndex}
                                    duplicateProducts={duplicateProducts}
                                    filter="all"
                                    onSelect={setSelectedIndex}
                                    onIncrement={incrementQuantity}
                                    onDecrement={decrementQuantity}
                                    onRemove={removeItem}
                                    onUpdatePrice={(index, value) => updateItem(index, 'unit_price', value)}
                                    onUpdateDiscount={(index, value) => updateItem(index, 'discount', value)}
                                    formatCurrency={formatCurrency}
                                    t={t}
                                />

                                <Divider sx={{ my: 2 }} />

                                {/* Totals */}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Box sx={{ width: 300 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography>{t('Sous-total')}:</Typography>
                                            <Typography fontWeight="medium">{formatCurrency(subtotal)}</Typography>
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
                                    <Button onClick={() => router.get(route('bills.index'))} disabled={processing}>
                                        {t('Annuler')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        disabled={processing || cartItems.length === 0}
                                    >
                                        {t('Créer la facture')}
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </form>
            )}
        </Layout>
    );
}
