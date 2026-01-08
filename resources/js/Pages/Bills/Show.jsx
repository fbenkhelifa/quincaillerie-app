import { useContext, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../../app';
import ConfirmDialog from '@/Components/ConfirmDialog';
import PrintableInvoice from '@/Components/PrintableInvoice';
import {
    Box,
    Button,
    Paper,
    Typography,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Divider,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import {
    Print as PrintIcon,
    PictureAsPdf as PdfIcon,
    ArrowBack as BackIcon,
    Cancel as CancelIcon,
    Close as CloseIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function BillsShow({ bill, storeSettings }) {
    const { t, locale } = useContext(AppContext);
    const printRef = useRef();
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [printDialogOpen, setPrintDialogOpen] = useState(false);
    const [printLang, setPrintLang] = useState('fr');

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('fr-DZ', {
            minimumFractionDigits: 2,
        }).format(value) + ' DA';
    };

    const handlePrint = () => {
        setPrintDialogOpen(true);
    };

    const executePrint = () => {
        const printContent = printRef.current;
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Facture ${bill.bill_number}</title>
                <style>
                    @media print {
                        body { margin: 0; padding: 0; }
                        @page { size: A4; margin: 0; }
                    }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const handleCancel = () => {
        router.post(route('bills.cancel', bill.id), {}, {
            onSuccess: () => {
                toast.success(t('Facture annulée avec succès'));
                setCancelDialogOpen(false);
            },
            onError: () => toast.error(t('Erreur lors de l\'annulation')),
        });
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
        card: t('Carte bancaire'),
        check: t('Chèque'),
        credit: t('Crédit'),
        other: t('Autre'),
    };

    return (
        <Layout
            title={t('Facture') + ' ' + bill.bill_number}
            breadcrumbs={[
                { label: t('Factures'), href: route('bills.index') },
                { label: bill.bill_number },
            ]}
        >
            <Head title={t('Facture') + ' ' + bill.bill_number} />

            {/* Actions Bar */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print">
                <Button
                    onClick={() => router.get(route('bills.index'))}
                    startIcon={<BackIcon />}
                >
                    {t('Retour')}
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {bill.status === 'completed' && (
                        <>
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={() => router.get(route('bills.edit', bill.id))}
                            >
                                {t('Modifier')}
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => setCancelDialogOpen(true)}
                            >
                                {t('Annuler')}
                            </Button>
                        </>
                    )}
                    <Button
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        onClick={handlePrint}
                    >
                        {t('Imprimer')}
                    </Button>
                    <Button
                        component="a"
                        href={route('bills.pdf', { bill: bill.id, lang: 'fr' })}
                        variant="outlined"
                        startIcon={<PdfIcon />}
                    >
                        PDF (FR)
                    </Button>
                    <Button
                        component="a"
                        href={route('bills.pdf', { bill: bill.id, lang: 'ar' })}
                        variant="contained"
                        startIcon={<PdfIcon />}
                    >
                        PDF (AR)
                    </Button>
                </Box>
            </Box>

            {/* Invoice */}
            <Paper sx={{ p: 4 }} ref={printRef}>
                {/* Header */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={6}>
                        <Typography variant="h4" fontWeight="bold" color="primary">
                            {storeSettings.store_name}
                        </Typography>
                        {storeSettings.owner_name && (
                            <Typography>{storeSettings.owner_name}</Typography>
                        )}
                        {storeSettings.address && (
                            <Typography color="text.secondary">{storeSettings.address}</Typography>
                        )}
                        {storeSettings.phone && (
                            <Typography color="text.secondary">{t('Tél')}: {storeSettings.phone}</Typography>
                        )}
                        {storeSettings.tax_id && (
                            <Typography color="text.secondary">{t('NIF')}: {storeSettings.tax_id}</Typography>
                        )}
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                        <Typography variant="h5" fontWeight="bold">
                            {t('FACTURE')}
                        </Typography>
                        <Typography variant="h6" color="primary">
                            {bill.bill_number}
                        </Typography>
                        <Typography color="text.secondary">
                            {t('Date')}: {new Date(bill.created_at).toLocaleDateString(
                                locale === 'ar' ? 'ar-DZ' : 'fr-FR',
                                { day: '2-digit', month: '2-digit', year: 'numeric' }
                            )}
                        </Typography>
                        <Chip
                            label={statusLabels[bill.status]}
                            color={statusColors[bill.status]}
                            sx={{ mt: 1 }}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ mb: 3 }} />

                {/* Customer Info */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                            {t('Client')}
                        </Typography>
                        <Typography fontWeight="medium">
                            {bill.customer_name || t('Client anonyme')}
                        </Typography>
                        {bill.customer_phone && (
                            <Typography>{bill.customer_phone}</Typography>
                        )}
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                            {t('Vendeur')}
                        </Typography>
                        <Typography fontWeight="medium">
                            {bill.worker?.name || '-'}
                        </Typography>
                        <Typography color="text.secondary">
                            {t('Mode de paiement')}: {paymentMethodLabels[bill.payment_method]}
                        </Typography>
                    </Grid>
                </Grid>

                {/* Items Table */}
                <Table sx={{ mb: 3 }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                            <TableCell>{t('Produit')}</TableCell>
                            <TableCell align="center">{t('Qté')}</TableCell>
                            <TableCell align="right">{t('Prix unit.')}</TableCell>
                            <TableCell align="right">{t('Remise')}</TableCell>
                            <TableCell align="right">{t('Total')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bill.items?.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <Typography>{item.product_name}</Typography>
                                    {item.product_sku && (
                                        <Typography variant="caption" color="text.secondary">
                                            SKU: {item.product_sku}
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    {item.quantity} {item.unit}
                                </TableCell>
                                <TableCell align="right">
                                    {formatCurrency(item.unit_price)}
                                </TableCell>
                                <TableCell align="right">
                                    {item.discount > 0 ? formatCurrency(item.discount) : '-'}
                                </TableCell>
                                <TableCell align="right">
                                    {formatCurrency(item.total)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Totals */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Box sx={{ width: 300 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>{t('Sous-total')}:</Typography>
                            <Typography>{formatCurrency(bill.subtotal)}</Typography>
                        </Box>
                        {bill.discount > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>{t('Remise')}:</Typography>
                                <Typography color="error">-{formatCurrency(bill.discount)}</Typography>
                            </Box>
                        )}
                        {bill.tax > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>{t('Taxe')}:</Typography>
                                <Typography>{formatCurrency(bill.tax)}</Typography>
                            </Box>
                        )}
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6" fontWeight="bold">{t('Total')}:</Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                                {formatCurrency(bill.total)}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Notes */}
                {bill.notes && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            {t('Notes')}:
                        </Typography>
                        <Typography>{bill.notes}</Typography>
                    </Box>
                )}

                {/* Footer */}
                <Box sx={{ mt: 4, pt: 2, borderTop: '1px dashed grey', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        {t('Merci pour votre achat!')}
                    </Typography>
                </Box>
            </Paper>

            <ConfirmDialog
                open={cancelDialogOpen}
                onClose={() => setCancelDialogOpen(false)}
                onConfirm={handleCancel}
                title={t('Annuler la facture')}
                message={t('Êtes-vous sûr de vouloir annuler cette facture ? Le stock sera restauré.')}
            />

            {/* Print Dialog */}
            <Dialog 
                open={printDialogOpen} 
                onClose={() => setPrintDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {t('Imprimer la facture')}
                    <IconButton onClick={() => setPrintDialogOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                        <ToggleButtonGroup
                            value={printLang}
                            exclusive
                            onChange={(e, val) => val && setPrintLang(val)}
                        >
                            <ToggleButton value="fr">Français</ToggleButton>
                            <ToggleButton value="ar">العربية</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                    
                    <Box 
                        sx={{ 
                            border: '1px solid #ddd', 
                            borderRadius: 1,
                            overflow: 'auto',
                            maxHeight: '60vh',
                            bgcolor: '#f5f5f5',
                            p: 2
                        }}
                    >
                        <Box ref={printRef}>
                            <PrintableInvoice 
                                bill={bill} 
                                storeSettings={storeSettings}
                                lang={printLang}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPrintDialogOpen(false)}>
                        {t('Fermer')}
                    </Button>
                    <Button 
                        variant="contained" 
                        startIcon={<PrintIcon />}
                        onClick={executePrint}
                    >
                        {t('Imprimer')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}
