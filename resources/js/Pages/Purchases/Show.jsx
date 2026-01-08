import { useContext, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../../app';
import {
    Box,
    Button,
    Paper,
    Typography,
    Chip,
    Grid,
    Divider,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress,
    alpha,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Edit as EditIcon,
    PictureAsPdf as PdfIcon,
    Send as SendIcon,
    Inventory as ReceiveIcon,
    Cancel as CancelIcon,
    Print as PrintIcon,
    LocalShipping as ShippingIcon,
    CheckCircle as CheckIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function PurchasesShow({ order }) {
    const { t, locale } = useContext(AppContext);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });

    const formatCurrency = (value) => {
        return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
            minimumFractionDigits: 2,
        }).format(value) + ' DA';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-FR');
    };

    const statusColors = {
        draft: 'default',
        sent: 'info',
        partial: 'warning',
        received: 'success',
        cancelled: 'error',
    };

    const statusLabels = {
        draft: t('Brouillon'),
        sent: t('Envoyée'),
        partial: t('Partielle'),
        received: t('Reçue'),
        cancelled: t('Annulée'),
    };

    const handleAction = (action) => {
        setConfirmDialog({ open: false, action: null });

        if (action === 'send') {
            router.post(route('purchases.send', order.id), {}, {
                onSuccess: () => toast.success(t('Commande envoyée')),
            });
        } else if (action === 'cancel') {
            router.post(route('purchases.cancel', order.id), {}, {
                onSuccess: () => toast.success(t('Commande annulée')),
            });
        }
    };

    const receivedPercentage = order.items?.length > 0
        ? (order.items.reduce((sum, item) => sum + (item.quantity_received || 0), 0) /
           order.items.reduce((sum, item) => sum + item.quantity_ordered, 0)) * 100
        : 0;

    return (
        <Layout>
            <Head title={`${t('Commande')} ${order.po_number}`} />

            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={() => router.visit(route('purchases.index'))}>
                            <BackIcon />
                        </IconButton>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h4" fontWeight="bold">
                                    {order.po_number}
                                </Typography>
                                <Chip
                                    label={statusLabels[order.status]}
                                    color={statusColors[order.status]}
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {t('Créée le')} {formatDate(order.created_at)} {t('par')} {order.user?.name}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {order.status === 'draft' && (
                            <>
                                <Button
                                    variant="outlined"
                                    startIcon={<EditIcon />}
                                    onClick={() => router.visit(route('purchases.edit', order.id))}
                                >
                                    {t('Modifier')}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<SendIcon />}
                                    onClick={() => setConfirmDialog({ open: true, action: 'send' })}
                                >
                                    {t('Envoyer')}
                                </Button>
                            </>
                        )}
                        
                        {(order.status === 'sent' || order.status === 'partial') && (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<ReceiveIcon />}
                                onClick={() => router.visit(route('purchases.receive.form', order.id))}
                            >
                                {t('Recevoir')}
                            </Button>
                        )}

                        <Button
                            variant="outlined"
                            startIcon={<PdfIcon />}
                            onClick={() => window.open(route('purchases.pdf', order.id), '_blank')}
                        >
                            {t('PDF')}
                        </Button>

                        {!['received', 'cancelled'].includes(order.status) && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => setConfirmDialog({ open: true, action: 'cancel' })}
                            >
                                {t('Annuler')}
                            </Button>
                        )}
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Order Info */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>
                                <ShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                {t('Fournisseur')}
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                                {order.supplier?.name}
                            </Typography>
                            {order.supplier?.phone && (
                                <Typography variant="body2" color="text.secondary">
                                    {order.supplier.phone}
                                </Typography>
                            )}
                            {order.supplier?.email && (
                                <Typography variant="body2" color="text.secondary">
                                    {order.supplier.email}
                                </Typography>
                            )}
                            {order.supplier?.address && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {order.supplier.address}
                                    {order.supplier.city && `, ${order.supplier.city}`}
                                </Typography>
                            )}

                            <Divider sx={{ my: 2 }} />

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        {t('Date commande')}
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {formatDate(order.order_date)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        {t('Date prévue')}
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {formatDate(order.expected_date)}
                                    </Typography>
                                </Grid>
                                {order.received_date && (
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary">
                                            {t('Date réception')}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500} color="success.main">
                                            {formatDate(order.received_date)}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>

                            {/* Progress bar for receiving */}
                            {['sent', 'partial', 'received'].includes(order.status) && (
                                <Box sx={{ mt: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {t('Réception')}
                                        </Typography>
                                        <Typography variant="caption" fontWeight={500}>
                                            {Math.round(receivedPercentage)}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={receivedPercentage}
                                        color={receivedPercentage === 100 ? 'success' : 'primary'}
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Items */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                {t('Articles')} ({order.items?.length || 0})
                            </Typography>

                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>{t('Produit')}</TableCell>
                                            <TableCell align="center">{t('Commandé')}</TableCell>
                                            <TableCell align="center">{t('Reçu')}</TableCell>
                                            <TableCell align="right">{t('Prix unit.')}</TableCell>
                                            <TableCell align="right">{t('Total')}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {order.items?.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {item.product_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {item.product_sku}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    {item.quantity_ordered} {item.unit}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                                        {item.quantity_received >= item.quantity_ordered ? (
                                                            <CheckIcon color="success" fontSize="small" />
                                                        ) : null}
                                                        <Typography
                                                            color={item.quantity_received >= item.quantity_ordered ? 'success.main' : 'text.primary'}
                                                        >
                                                            {item.quantity_received || 0}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">
                                                    {formatCurrency(item.unit_cost)}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 500 }}>
                                                    {formatCurrency(item.total)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Totals */}
                            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                                <Grid container justifyContent="flex-end">
                                    <Grid item xs={12} md={5}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography color="text.secondary">{t('Sous-total')}</Typography>
                                            <Typography>{formatCurrency(order.subtotal)}</Typography>
                                        </Box>
                                        {order.tax > 0 && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography color="text.secondary">{t('Taxes')}</Typography>
                                                <Typography>{formatCurrency(order.tax)}</Typography>
                                            </Box>
                                        )}
                                        {order.shipping > 0 && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography color="text.secondary">{t('Livraison')}</Typography>
                                                <Typography>{formatCurrency(order.shipping)}</Typography>
                                            </Box>
                                        )}
                                        <Divider sx={{ my: 1 }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="h6">{t('Total')}</Typography>
                                            <Typography variant="h6" color="primary">
                                                {formatCurrency(order.total)}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>

                        {/* Notes */}
                        {(order.notes || order.supplier_notes) && (
                            <Paper sx={{ p: 3, mt: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    {t('Notes')}
                                </Typography>
                                {order.notes && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {t('Notes internes')}
                                        </Typography>
                                        <Typography variant="body2">{order.notes}</Typography>
                                    </Box>
                                )}
                                {order.supplier_notes && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {t('Notes fournisseur')}
                                        </Typography>
                                        <Typography variant="body2">{order.supplier_notes}</Typography>
                                    </Box>
                                )}
                            </Paper>
                        )}
                    </Grid>
                </Grid>
            </Box>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, action: null })}>
                <DialogTitle>
                    {confirmDialog.action === 'send' ? t('Envoyer la commande ?') : t('Annuler la commande ?')}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {confirmDialog.action === 'send'
                            ? t('La commande sera marquée comme envoyée au fournisseur.')
                            : t('Cette action est irréversible.')}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ open: false, action: null })}>
                        {t('Annuler')}
                    </Button>
                    <Button
                        variant="contained"
                        color={confirmDialog.action === 'cancel' ? 'error' : 'primary'}
                        onClick={() => handleAction(confirmDialog.action)}
                    >
                        {t('Confirmer')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}
