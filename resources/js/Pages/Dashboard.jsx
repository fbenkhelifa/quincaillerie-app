import { useContext } from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../app';
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
} from '@mui/material';
import {
    Inventory as InventoryIcon,
    Warning as WarningIcon,
    TrendingUp as TrendingUpIcon,
    Receipt as ReceiptIcon,
    AttachMoney as MoneyIcon,
    LocalShipping as ShippingIcon,
    Add as AddIcon,
} from '@mui/icons-material';

function StatCard({ title, value, icon, color = 'primary', subtitle }) {
    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography color="text.secondary" variant="body2" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h4" component="div" fontWeight="bold">
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" color="text.secondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    <Avatar sx={{ bgcolor: `${color}.light`, width: 56, height: 56 }}>
                        {icon}
                    </Avatar>
                </Box>
            </CardContent>
        </Card>
    );
}

export default function Dashboard({ stats, recentBills, lowStockProducts, recentMovements }) {
    const { t, locale } = useContext(AppContext);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
            style: 'decimal',
            minimumFractionDigits: 2,
        }).format(value) + ' DA';
    };

    return (
        <Layout title={t('Tableau de bord')}>
            <Head title={t('Tableau de bord')} />

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">
                    {t('Tableau de bord')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        component={Link}
                        href={route('products.create')}
                        variant="contained"
                        startIcon={<AddIcon />}
                    >
                        {t('Nouveau produit')}
                    </Button>
                    <Button
                        component={Link}
                        href={route('bills.create')}
                        variant="outlined"
                        startIcon={<ReceiptIcon />}
                    >
                        {t('Nouvelle facture')}
                    </Button>
                </Box>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title={t('Total produits')}
                        value={stats.total_products}
                        icon={<InventoryIcon sx={{ color: 'primary.main' }} />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title={t('Stock bas')}
                        value={stats.low_stock_count}
                        icon={<WarningIcon sx={{ color: 'warning.main' }} />}
                        color="warning"
                        subtitle={`${stats.out_of_stock_count} ${t('en rupture')}`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title={t("Ventes du jour")}
                        value={formatCurrency(stats.today_sales)}
                        icon={<TrendingUpIcon sx={{ color: 'success.main' }} />}
                        color="success"
                        subtitle={`${stats.today_bills_count} ${t('factures')}`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title={t('Valeur stock')}
                        value={formatCurrency(stats.inventory_value)}
                        icon={<MoneyIcon sx={{ color: 'info.main' }} />}
                        color="info"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Low Stock Products */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                                {t('Stock bas')}
                            </Typography>
                            <Button
                                component={Link}
                                href={route('products.index') + '?stock_status=low'}
                                size="small"
                            >
                                {t('Voir tout')}
                            </Button>
                        </Box>
                        <List dense>
                            {lowStockProducts?.length > 0 ? (
                                lowStockProducts.map((product) => (
                                    <ListItem
                                        key={product.id}
                                        secondaryAction={
                                            <Chip
                                                label={`${product.quantity} ${product.unit}`}
                                                size="small"
                                                color={product.quantity <= 0 ? 'error' : 'warning'}
                                            />
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'warning.light' }}>
                                                <WarningIcon color="warning" />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={product.name}
                                            secondary={product.category || '-'}
                                        />
                                    </ListItem>
                                ))
                            ) : (
                                <ListItem>
                                    <ListItemText
                                        primary={t('Aucun produit en stock bas')}
                                        sx={{ textAlign: 'center', color: 'text.secondary' }}
                                    />
                                </ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>

                {/* Recent Bills */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                                {t('Dernières factures')}
                            </Typography>
                            <Button
                                component={Link}
                                href={route('bills.index')}
                                size="small"
                            >
                                {t('Voir tout')}
                            </Button>
                        </Box>
                        <List dense>
                            {recentBills?.length > 0 ? (
                                recentBills.map((bill) => (
                                    <ListItem
                                        key={bill.id}
                                        secondaryAction={
                                            <Typography variant="body2" fontWeight="bold" color="success.main">
                                                {formatCurrency(bill.total)}
                                            </Typography>
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'success.light' }}>
                                                <ReceiptIcon color="success" />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={bill.bill_number}
                                            secondary={`${bill.worker_name || '-'} • ${bill.created_at}`}
                                        />
                                    </ListItem>
                                ))
                            ) : (
                                <ListItem>
                                    <ListItemText
                                        primary={t('Aucune facture récente')}
                                        sx={{ textAlign: 'center', color: 'text.secondary' }}
                                    />
                                </ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>

                {/* Recent Movements */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                                {t('Derniers mouvements de stock')}
                            </Typography>
                        </Box>
                        <List dense>
                            {recentMovements?.length > 0 ? (
                                recentMovements.map((movement) => (
                                    <ListItem key={movement.id}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ 
                                                bgcolor: movement.quantity_change > 0 ? 'success.light' : 'error.light' 
                                            }}>
                                                {movement.quantity_change > 0 ? '+' : '-'}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={movement.product_name}
                                            secondary={`${movement.type_label} • ${movement.user_name || '-'} • ${movement.created_at}`}
                                        />
                                        <Chip
                                            label={`${movement.quantity_change > 0 ? '+' : ''}${movement.quantity_change}`}
                                            size="small"
                                            color={movement.quantity_change > 0 ? 'success' : 'error'}
                                        />
                                    </ListItem>
                                ))
                            ) : (
                                <ListItem>
                                    <ListItemText
                                        primary={t('Aucun mouvement récent')}
                                        sx={{ textAlign: 'center', color: 'text.secondary' }}
                                    />
                                </ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Layout>
    );
}
