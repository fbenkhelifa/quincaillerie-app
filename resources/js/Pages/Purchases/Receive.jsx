import { useContext, useState, useMemo } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../../app';
import {
    Box,
    Button,
    Paper,
    Typography,
    Chip,
    Grid,
    TextField,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    InputAdornment,
    LinearProgress,
    Alert,
    alpha,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Inventory as ReceiveIcon,
    CheckCircle as CheckIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function PurchasesReceive({ order }) {
    const { t, locale } = useContext(AppContext);

    // Initialize form with current items and their pending quantities
    const initialItems = order.items?.map(item => ({
        item_id: item.id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        unit: item.unit,
        quantity_ordered: item.quantity_ordered,
        quantity_already_received: item.quantity_received || 0,
        quantity_pending: item.quantity_ordered - (item.quantity_received || 0),
        quantity_received: 0, // What we're receiving now
    })) || [];

    const { data, setData, post, processing, errors } = useForm({
        items: initialItems,
    });

    const formatCurrency = (value) => {
        return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
            minimumFractionDigits: 2,
        }).format(value) + ' DA';
    };

    const updateQuantity = (index, value) => {
        const qty = parseFloat(value) || 0;
        const maxQty = data.items[index].quantity_pending;
        const clampedQty = Math.min(Math.max(0, qty), maxQty);

        const updated = [...data.items];
        updated[index] = { ...updated[index], quantity_received: clampedQty };
        setData('items', updated);
    };

    const receiveAll = () => {
        const updated = data.items.map(item => ({
            ...item,
            quantity_received: item.quantity_pending,
        }));
        setData('items', updated);
    };

    const totalToReceive = useMemo(() => {
        return data.items.reduce((sum, item) => sum + item.quantity_received, 0);
    }, [data.items]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const itemsToReceive = data.items.filter(item => item.quantity_received > 0);

        if (itemsToReceive.length === 0) {
            toast.error(t('Sélectionnez au moins un article à recevoir'));
            return;
        }

        post(route('purchases.receive', order.id), {
            onSuccess: () => {
                toast.success(t('Marchandises reçues avec succès'));
            },
            onError: (errors) => {
                toast.error(errors.error || t('Erreur lors de la réception'));
            },
        });
    };

    // Calculate overall progress
    const overallReceived = order.items?.reduce((sum, item) => sum + (item.quantity_received || 0), 0) || 0;
    const overallOrdered = order.items?.reduce((sum, item) => sum + item.quantity_ordered, 0) || 0;
    const progressPercent = overallOrdered > 0 ? (overallReceived / overallOrdered) * 100 : 0;

    return (
        <Layout>
            <Head title={`${t('Réception')} - ${order.po_number}`} />

            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={() => router.visit(route('purchases.show', order.id))}>
                            <BackIcon />
                        </IconButton>
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                {t('Réception de marchandises')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {order.po_number} - {order.supplier?.name}
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="outlined"
                        onClick={receiveAll}
                    >
                        {t('Tout recevoir')}
                    </Button>
                </Box>

                {/* Progress */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            {t('Progression globale de la réception')}
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                            {overallReceived} / {overallOrdered} ({Math.round(progressPercent)}%)
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progressPercent}
                        sx={{ height: 10, borderRadius: 5 }}
                        color={progressPercent === 100 ? 'success' : 'primary'}
                    />
                </Paper>

                <form onSubmit={handleSubmit}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            {t('Articles à recevoir')}
                        </Typography>

                        {errors.items && (
                            <Alert severity="error" sx={{ mb: 2 }}>{errors.items}</Alert>
                        )}

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('Produit')}</TableCell>
                                        <TableCell align="center">{t('Commandé')}</TableCell>
                                        <TableCell align="center">{t('Déjà reçu')}</TableCell>
                                        <TableCell align="center">{t('En attente')}</TableCell>
                                        <TableCell align="center" sx={{ width: 180 }}>{t('Recevoir maintenant')}</TableCell>
                                        <TableCell align="center">{t('Statut')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.items.map((item, index) => {
                                        const isComplete = item.quantity_pending <= 0;
                                        const willBeComplete = item.quantity_received >= item.quantity_pending;

                                        return (
                                            <TableRow
                                                key={item.item_id}
                                                sx={{
                                                    bgcolor: isComplete
                                                        ? alpha('#4caf50', 0.08)
                                                        : item.quantity_received > 0
                                                            ? alpha('#2196f3', 0.08)
                                                            : 'transparent',
                                                }}
                                            >
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
                                                    <Typography color={item.quantity_already_received > 0 ? 'success.main' : 'text.secondary'}>
                                                        {item.quantity_already_received}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography
                                                        fontWeight={500}
                                                        color={item.quantity_pending > 0 ? 'warning.main' : 'success.main'}
                                                    >
                                                        {item.quantity_pending}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    {isComplete ? (
                                                        <Chip
                                                            icon={<CheckIcon />}
                                                            label={t('Complet')}
                                                            color="success"
                                                            size="small"
                                                        />
                                                    ) : (
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={item.quantity_received}
                                                            onChange={(e) => updateQuantity(index, e.target.value)}
                                                            inputProps={{
                                                                min: 0,
                                                                max: item.quantity_pending,
                                                                step: 0.01,
                                                            }}
                                                            sx={{ width: 120 }}
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <Typography variant="caption">{item.unit}</Typography>
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {isComplete ? (
                                                        <CheckIcon color="success" />
                                                    ) : willBeComplete && item.quantity_received > 0 ? (
                                                        <Chip label={t('Sera complet')} color="success" size="small" variant="outlined" />
                                                    ) : item.quantity_received > 0 ? (
                                                        <Chip label={t('Partiel')} color="warning" size="small" variant="outlined" />
                                                    ) : (
                                                        <WarningIcon color="warning" />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Summary & Submit */}
                        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    {t('Total à recevoir dans cette opération')}:
                                </Typography>
                                <Typography variant="h5" fontWeight="bold" color="primary">
                                    {totalToReceive} {t('articles')}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => router.visit(route('purchases.show', order.id))}
                                >
                                    {t('Annuler')}
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="success"
                                    size="large"
                                    startIcon={<ReceiveIcon />}
                                    disabled={processing || totalToReceive === 0}
                                >
                                    {t('Confirmer la réception')}
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </form>
            </Box>
        </Layout>
    );
}
