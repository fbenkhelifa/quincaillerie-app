import { useContext, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../../app';
import {
    Box,
    Button,
    TextField,
    Paper,
    Typography,
    Grid,
    Divider,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function SettingsIndex({ settings }) {
    const { t } = useContext(AppContext);
    
    const { data, setData, put, processing, errors } = useForm({
        store_name: settings?.store_name || '',
        store_name_ar: settings?.store_name_ar || '',
        owner_name: settings?.owner_name || '',
        owner_name_ar: settings?.owner_name_ar || '',
        address: settings?.address || '',
        address_ar: settings?.address_ar || '',
        phone: settings?.phone || '',
        email: settings?.email || '',
        tax_id: settings?.tax_id || '',
        rc_number: settings?.rc_number || '',
        ai_number: settings?.ai_number || '',
        nis_number: settings?.nis_number || '',
        invoice_footer: settings?.invoice_footer || '',
        invoice_footer_ar: settings?.invoice_footer_ar || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('settings.update'), {
            onSuccess: () => toast.success(t('Paramètres enregistrés avec succès')),
            onError: () => toast.error(t('Erreur lors de l\'enregistrement')),
        });
    };

    return (
        <Layout
            title={t('Paramètres')}
            breadcrumbs={[{ label: t('Paramètres') }]}
        >
            <Head title={t('Paramètres')} />

            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    {t('Paramètres du magasin')}
                </Typography>
                <Typography color="text.secondary">
                    {t('Configurez les informations qui apparaissent sur vos factures')}
                </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* Store Information */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                {t('Informations du magasin (Français)')}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    label={t('Nom du magasin')}
                                    value={data.store_name}
                                    onChange={(e) => setData('store_name', e.target.value)}
                                    error={!!errors.store_name}
                                    helperText={errors.store_name}
                                    fullWidth
                                    required
                                />
                                <TextField
                                    label={t('Nom du propriétaire')}
                                    value={data.owner_name}
                                    onChange={(e) => setData('owner_name', e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    label={t('Adresse')}
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    multiline
                                    rows={2}
                                    fullWidth
                                />
                                <TextField
                                    label={t('Pied de page facture')}
                                    value={data.invoice_footer}
                                    onChange={(e) => setData('invoice_footer', e.target.value)}
                                    placeholder={t('Merci pour votre achat!')}
                                    fullWidth
                                />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Arabic Information */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                {t('Informations du magasin (Arabe)')}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    label={t('Nom du magasin (arabe)')}
                                    value={data.store_name_ar}
                                    onChange={(e) => setData('store_name_ar', e.target.value)}
                                    fullWidth
                                    dir="rtl"
                                />
                                <TextField
                                    label={t('Nom du propriétaire (arabe)')}
                                    value={data.owner_name_ar}
                                    onChange={(e) => setData('owner_name_ar', e.target.value)}
                                    fullWidth
                                    dir="rtl"
                                />
                                <TextField
                                    label={t('Adresse (arabe)')}
                                    value={data.address_ar}
                                    onChange={(e) => setData('address_ar', e.target.value)}
                                    multiline
                                    rows={2}
                                    fullWidth
                                    dir="rtl"
                                />
                                <TextField
                                    label={t('Pied de page facture (arabe)')}
                                    value={data.invoice_footer_ar}
                                    onChange={(e) => setData('invoice_footer_ar', e.target.value)}
                                    placeholder="شكرا لتسوقكم!"
                                    fullWidth
                                    dir="rtl"
                                />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Contact Information */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                {t('Contact')}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    label={t('Téléphone')}
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    label={t('Email')}
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    fullWidth
                                />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Tax Information */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                {t('Informations fiscales')}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    label={t('NIF (Numéro d\'Identification Fiscale)')}
                                    value={data.tax_id}
                                    onChange={(e) => setData('tax_id', e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    label={t('RC (Registre de Commerce)')}
                                    value={data.rc_number}
                                    onChange={(e) => setData('rc_number', e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    label={t('AI (Article d\'Imposition)')}
                                    value={data.ai_number}
                                    onChange={(e) => setData('ai_number', e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    label={t('NIS (Numéro d\'Identification Statistique)')}
                                    value={data.nis_number}
                                    onChange={(e) => setData('nis_number', e.target.value)}
                                    fullWidth
                                />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Submit */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                startIcon={<SaveIcon />}
                                disabled={processing}
                            >
                                {t('Enregistrer les paramètres')}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Layout>
    );
}
