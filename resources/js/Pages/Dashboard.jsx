import { useContext } from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../app';
import { StatCard, EmptyState, PageHeader } from '@/Components/ui';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    Divider,
    Button,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Inventory as InventoryIcon,
    Warning as WarningIcon,
    TrendingUp as TrendingUpIcon,
    Receipt as ReceiptIcon,
    AttachMoney as MoneyIcon,
    LocalShipping as ShippingIcon,
    Add as AddIcon,
    ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

export default function Dashboard({ stats, recentBills, lowStockProducts, recentMovements }) {
    const { t, locale } = useContext(AppContext);
    const theme = useTheme();

    const formatCurrency = (value) => {
        return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
            style: 'decimal',
            minimumFractionDigits: 2,
        }).format(value) + ' DA';
    };

    return (
        <Layout
            title={t('Tableau de bord')}
            breadcrumbs={[{ label: t('Tableau de bord') }]}
        >
            <Head title={t('Tableau de bord')} />

            {/* Quick Actions */}
            <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                    component={Link}
                    href={route('products.create')}
                    variant="contained"
                    startIcon={<AddIcon />}
                    size="large"
                >
                    {t('Nouveau produit')}
                </Button>
                <Button
                    component={Link}
                    href={route('bills.create')}
                    variant="outlined"
                    startIcon={<ReceiptIcon />}
                    size="large"
                >
                    {t('Nouvelle facture')}
                </Button>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title={t('Total produits')}
                        value={stats.total_products?.toLocaleString() || '0'}
                        icon={<InventoryIcon sx={{ fontSize: 28 }} />}
                        color="primary"
                        subtitle={t('articles en stock')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title={t('Stock bas')}
                        value={stats.low_stock_count || '0'}
                        icon={<WarningIcon sx={{ fontSize: 28 }} />}
                        color="warning"
                        subtitle={`${stats.out_of_stock_count || 0} ${t('en rupture')}`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title={t("Ventes du jour")}
                        value={formatCurrency(stats.today_sales || 0)}
                        icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
                        color="success"
                        subtitle={`${stats.today_bills_count || 0} ${t('factures')}`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title={t('Valeur stock')}
                        value={formatCurrency(stats.inventory_value || 0)}
                        icon={<MoneyIcon sx={{ fontSize: 28 }} />}
                        color="info"
                        subtitle={t('valeur totale')}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Low Stock Products */}
                <Grid item xs={12} lg={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={600}>
                                    {t('Stock bas')}
                                </Typography>
                                <Button
                                    component={Link}
                                    href={route('products.index') + '?stock_status=low'}
                                    size="small"
                                    endIcon={<ArrowForwardIcon />}
                                >
                                    {t('Voir tout')}
                                </Button>
                            </Box>
                            
                            {lowStockProducts?.length > 0 ? (
                                <List disablePadding>
                                    {lowStockProducts.map((product, index) => (
                                        <ListItem
                                            key={product.id}
                                            sx={{
                                                px: 0,
                                                borderBottom: index < lowStockProducts.length - 1 ? 1 : 0,
                                                borderColor: 'divider',
                                            }}
                                            secondaryAction={
                                                <Chip
                                                    label={`${product.quantity} ${product.unit}`}
                                                    size="small"
                                                    color={product.quantity <= 0 ? 'error' : 'warning'}
                                                />
                                            }
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: product.quantity <= 0
                                                            ? alpha(theme.palette.error.main, 0.1)
                                                            : alpha(theme.palette.warning.main, 0.1),
                                                    }}
                                                >
                                                    <WarningIcon
                                                        sx={{
                                                            color: product.quantity <= 0 ? 'error.main' : 'warning.main',
                                                            fontSize: 20,
                                                        }}
                                                    />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={product.name}
                                                secondary={product.category || '-'}
                                                primaryTypographyProps={{ fontWeight: 500 }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <EmptyState
                                    type="empty"
                                    title={t('Aucun produit en stock bas')}
                                    description={t('Tous les produits ont un niveau de stock suffisant')}
                                    size="small"
                                />
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Bills */}
                <Grid item xs={12} lg={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={600}>
                                    {t('Dernières factures')}
                                </Typography>
                                <Button
                                    component={Link}
                                    href={route('bills.index')}
                                    size="small"
                                    endIcon={<ArrowForwardIcon />}
                                >
                                    {t('Voir tout')}
                                </Button>
                            </Box>
                            
                            {recentBills?.length > 0 ? (
                                <List disablePadding>
                                    {recentBills.map((bill, index) => (
                                        <ListItem
                                            key={bill.id}
                                            sx={{
                                                px: 0,
                                                borderBottom: index < recentBills.length - 1 ? 1 : 0,
                                                borderColor: 'divider',
                                            }}
                                            secondaryAction={
                                                <Typography variant="body2" fontWeight={600} color="success.main">
                                                    {formatCurrency(bill.total)}
                                                </Typography>
                                            }
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                                                    <ReceiptIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={bill.bill_number}
                                                secondary={`${bill.worker_name || '-'} • ${bill.created_at}`}
                                                primaryTypographyProps={{ fontWeight: 500 }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <EmptyState
                                    type="empty"
                                    title={t('Aucune facture récente')}
                                    description={t('Créez votre première facture pour la voir apparaître ici')}
                                    size="small"
                                />
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Movements */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={600}>
                                    {t('Derniers mouvements de stock')}
                                </Typography>
                            </Box>
                            
                            {recentMovements?.length > 0 ? (
                                <List disablePadding>
                                    {recentMovements.map((movement, index) => (
                                        <ListItem
                                            key={movement.id}
                                            sx={{
                                                px: 0,
                                                borderBottom: index < recentMovements.length - 1 ? 1 : 0,
                                                borderColor: 'divider',
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: movement.quantity_change > 0
                                                            ? alpha(theme.palette.success.main, 0.1)
                                                            : alpha(theme.palette.error.main, 0.1),
                                                    }}
                                                >
                                                    <Typography
                                                        fontWeight={600}
                                                        sx={{
                                                            color: movement.quantity_change > 0 ? 'success.main' : 'error.main',
                                                            fontSize: '0.875rem',
                                                        }}
                                                    >
                                                        {movement.quantity_change > 0 ? '+' : '−'}
                                                    </Typography>
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={movement.product_name}
                                                secondary={`${movement.type_label} • ${movement.user_name || '-'} • ${movement.created_at}`}
                                                primaryTypographyProps={{ fontWeight: 500 }}
                                            />
                                            <Chip
                                                label={`${movement.quantity_change > 0 ? '+' : ''}${movement.quantity_change}`}
                                                size="small"
                                                color={movement.quantity_change > 0 ? 'success' : 'error'}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <EmptyState
                                    type="empty"
                                    title={t('Aucun mouvement récent')}
                                    description={t('Les mouvements de stock apparaîtront ici')}
                                    size="small"
                                />
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Layout>
    );
}
