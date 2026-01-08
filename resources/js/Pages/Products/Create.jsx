import { useContext, useState } from 'react';
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
    FormControlLabel,
    Switch,
    Chip,
    OutlinedInput,
    Avatar,
    InputAdornment,
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as BackIcon,
    CloudUpload as UploadIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function ProductCreate({ categories, suppliers }) {
    const { t, locale } = useContext(AppContext);
    const [imagePreview, setImagePreview] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        name_ar: '',
        sku: '',
        barcode: '',
        description: '',
        category_id: '',
        purchase_price: '',
        selling_price: '',
        quantity: 0,
        unit: 'pièce',
        min_stock: 0,
        location: '',
        image: null,
        is_active: true,
        suppliers: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('products.store'), {
            forceFormData: true,
            onSuccess: () => toast.success(t('Produit créé avec succès')),
            onError: () => toast.error(t('Erreur lors de la création du produit')),
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const units = [
        { value: 'pièce', label: t('Pièce') },
        { value: 'kg', label: t('Kilogramme') },
        { value: 'mètre', label: t('Mètre') },
        { value: 'litre', label: t('Litre') },
        { value: 'boîte', label: t('Boîte') },
        { value: 'lot', label: t('Lot') },
        { value: 'rouleau', label: t('Rouleau') },
        { value: 'seau', label: t('Seau') },
        { value: 'pot', label: t('Pot') },
        { value: 'bouteille', label: t('Bouteille') },
        { value: 'paire', label: t('Paire') },
        { value: 'cartouche', label: t('Cartouche') },
    ];

    return (
        <Layout
            title={t('Nouveau produit')}
            breadcrumbs={[
                { label: t('Produits'), href: route('products.index') },
                { label: t('Nouveau') },
            ]}
        >
            <Head title={t('Nouveau produit')} />

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">
                    {t('Nouveau produit')}
                </Typography>
                <Button
                    onClick={() => router.get(route('products.index'))}
                    startIcon={<BackIcon />}
                >
                    {t('Retour')}
                </Button>
            </Box>

            <Paper sx={{ p: 3 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Image Upload */}
                        <Grid item xs={12} md={3}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2,
                                }}
                            >
                                <Avatar
                                    src={imagePreview}
                                    variant="rounded"
                                    sx={{ width: 150, height: 150 }}
                                >
                                    {data.name?.charAt(0) || '?'}
                                </Avatar>
                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<UploadIcon />}
                                >
                                    {t('Télécharger image')}
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </Button>
                                {errors.image && (
                                    <Typography color="error" variant="caption">
                                        {errors.image}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>

                        {/* Basic Info */}
                        <Grid item xs={12} md={9}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label={t('Nom du produit')}
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        error={!!errors.name}
                                        helperText={errors.name}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label={t('Nom en arabe')}
                                        value={data.name_ar}
                                        onChange={(e) => setData('name_ar', e.target.value)}
                                        error={!!errors.name_ar}
                                        helperText={errors.name_ar}
                                        fullWidth
                                        dir="rtl"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label={t('SKU')}
                                        value={data.sku}
                                        onChange={(e) => setData('sku', e.target.value)}
                                        error={!!errors.sku}
                                        helperText={errors.sku}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label={t('Code-barres')}
                                        value={data.barcode}
                                        onChange={(e) => setData('barcode', e.target.value)}
                                        error={!!errors.barcode}
                                        helperText={errors.barcode}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label={t('Description')}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        error={!!errors.description}
                                        helperText={errors.description}
                                        fullWidth
                                        multiline
                                        rows={3}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Category & Suppliers */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!errors.category_id}>
                                <InputLabel>{t('Catégorie')}</InputLabel>
                                <Select
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    label={t('Catégorie')}
                                >
                                    <MenuItem value="">{t('Sélectionner')}</MenuItem>
                                    {categories.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id}>
                                            {locale === 'ar' && cat.name_ar ? cat.name_ar : cat.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>{t('Fournisseurs')}</InputLabel>
                                <Select
                                    multiple
                                    value={data.suppliers}
                                    onChange={(e) => setData('suppliers', e.target.value)}
                                    input={<OutlinedInput label={t('Fournisseurs')} />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((id) => {
                                                const sup = suppliers.find((s) => s.id === id);
                                                return <Chip key={id} label={sup?.name} size="small" />;
                                            })}
                                        </Box>
                                    )}
                                >
                                    {suppliers.map((sup) => (
                                        <MenuItem key={sup.id} value={sup.id}>
                                            {sup.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Pricing */}
                        <Grid item xs={12} md={4}>
                            <TextField
                                label={t('Prix d\'achat')}
                                type="number"
                                value={data.purchase_price}
                                onChange={(e) => setData('purchase_price', e.target.value)}
                                error={!!errors.purchase_price}
                                helperText={errors.purchase_price}
                                fullWidth
                                required
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">DA</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label={t('Prix de vente')}
                                type="number"
                                value={data.selling_price}
                                onChange={(e) => setData('selling_price', e.target.value)}
                                error={!!errors.selling_price}
                                helperText={errors.selling_price}
                                fullWidth
                                required
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">DA</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label={t('Marge')}
                                value={
                                    data.purchase_price && data.selling_price
                                        ? `${(((data.selling_price - data.purchase_price) / data.purchase_price) * 100).toFixed(1)}%`
                                        : '0%'
                                }
                                fullWidth
                                disabled
                            />
                        </Grid>

                        {/* Stock */}
                        <Grid item xs={12} md={3}>
                            <TextField
                                label={t('Quantité initiale')}
                                type="number"
                                value={data.quantity}
                                onChange={(e) => setData('quantity', e.target.value)}
                                error={!!errors.quantity}
                                helperText={errors.quantity}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>{t('Unité')}</InputLabel>
                                <Select
                                    value={data.unit}
                                    onChange={(e) => setData('unit', e.target.value)}
                                    label={t('Unité')}
                                >
                                    {units.map((unit) => (
                                        <MenuItem key={unit.value} value={unit.value}>
                                            {unit.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label={t('Stock minimum')}
                                type="number"
                                value={data.min_stock}
                                onChange={(e) => setData('min_stock', e.target.value)}
                                error={!!errors.min_stock}
                                helperText={errors.min_stock}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label={t('Emplacement')}
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                error={!!errors.location}
                                helperText={errors.location}
                                fullWidth
                                placeholder="R1-E3"
                            />
                        </Grid>

                        {/* Active Switch */}
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                }
                                label={t('Produit actif')}
                            />
                        </Grid>

                        {/* Submit */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button
                                    onClick={() => router.get(route('products.index'))}
                                    disabled={processing}
                                >
                                    {t('Annuler')}
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    disabled={processing}
                                >
                                    {t('Enregistrer')}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Layout>
    );
}
