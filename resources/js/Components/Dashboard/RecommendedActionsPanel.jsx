/**
 * Recommended Actions Panel
 * =========================
 * Smart recommendations panel with actionable insights.
 */

import { useContext } from 'react';
import { Link } from '@inertiajs/react';
import { AppContext } from '@/app';
import {
    Box,
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    Button,
    Chip,
    Avatar,
    Divider,
    alpha,
    useTheme,
    Skeleton,
} from '@mui/material';
import {
    ShoppingCart as ReorderIcon,
    Warning as AlertIcon,
    Inventory as StockIcon,
    TrendingDown as DeadStockIcon,
    Speed as UrgentIcon,
    ArrowForward as ArrowIcon,
    CheckCircle as CheckIcon,
    PriorityHigh as PriorityIcon,
} from '@mui/icons-material';

const URGENCY_COLORS = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'default',
};

const URGENCY_LABELS = {
    critical: 'Critique',
    high: 'Haute',
    medium: 'Moyenne',
    low: 'Basse',
};

export default function RecommendedActionsPanel({
    reorderSuggestions = [],
    alerts = [],
    deadStock = [],
    loading = false,
}) {
    const { t } = useContext(AppContext);
    const theme = useTheme();

    const hasRecommendations = reorderSuggestions.length > 0 || alerts.length > 0 || deadStock.length > 0;

    if (loading) {
        return (
            <Card>
                <CardContent>
                    <Skeleton variant="text" width={200} height={28} sx={{ mb: 2 }} />
                    {[1, 2, 3].map((i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Skeleton variant="circular" width={40} height={40} />
                            <Box sx={{ flex: 1 }}>
                                <Skeleton variant="text" width="60%" />
                                <Skeleton variant="text" width="80%" />
                            </Box>
                        </Box>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (!hasRecommendations) {
        return (
            <Card
                sx={{
                    background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                }}
            >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Avatar
                        sx={{
                            width: 64,
                            height: 64,
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            mx: 'auto',
                            mb: 2,
                        }}
                    >
                        <CheckIcon sx={{ fontSize: 32, color: 'success.main' }} />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} color="success.main">
                        {t('Tout est en ordre !')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {t('Aucune action recommandée pour le moment.')}
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PriorityIcon sx={{ color: 'warning.main' }} />
                        <Typography variant="h6" fontWeight={600}>
                            {t('Actions recommandées')}
                        </Typography>
                    </Box>
                    <Chip
                        size="small"
                        label={`${reorderSuggestions.length + alerts.length + deadStock.length} ${t('actions')}`}
                        color="warning"
                    />
                </Box>

                <List disablePadding>
                    {/* Reorder Suggestions */}
                    {reorderSuggestions.slice(0, 3).map((suggestion, index) => (
                        <ListItem
                            key={`reorder-${suggestion.id || index}`}
                            sx={{
                                px: 0,
                                py: 1.5,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 48 }}>
                                <Avatar
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    }}
                                >
                                    <ReorderIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                </Avatar>
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 200 }}>
                                            {suggestion.product_name}
                                        </Typography>
                                        <Chip
                                            size="small"
                                            label={t(URGENCY_LABELS[suggestion.urgency] || 'Normal')}
                                            color={URGENCY_COLORS[suggestion.urgency] || 'default'}
                                            sx={{ height: 20, fontSize: '0.7rem' }}
                                        />
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="caption" color="text.secondary">
                                        {t('Commander')} {suggestion.suggested_quantity} {suggestion.unit || t('unités')} • Stock: {suggestion.current_stock}
                                    </Typography>
                                }
                            />
                            <ListItemSecondaryAction>
                                <Button
                                    component={Link}
                                    href={route('replenishment.index')}
                                    size="small"
                                    endIcon={<ArrowIcon />}
                                >
                                    {t('Voir')}
                                </Button>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}

                    {/* Alerts */}
                    {alerts.slice(0, 2).map((alert, index) => (
                        <ListItem
                            key={`alert-${alert.id || index}`}
                            sx={{
                                px: 0,
                                py: 1.5,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 48 }}>
                                <Avatar
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: alpha(theme.palette.error.main, 0.1),
                                    }}
                                >
                                    <AlertIcon sx={{ fontSize: 18, color: 'error.main' }} />
                                </Avatar>
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 200 }}>
                                            {alert.title || alert.finding_type}
                                        </Typography>
                                        <Chip
                                            size="small"
                                            label={t(URGENCY_LABELS[alert.severity] || 'Alerte')}
                                            color={URGENCY_COLORS[alert.severity] || 'error'}
                                            sx={{ height: 20, fontSize: '0.7rem' }}
                                        />
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                        {alert.description || alert.product_name}
                                    </Typography>
                                }
                            />
                            <ListItemSecondaryAction>
                                <Button
                                    component={Link}
                                    href={route('findings.index')}
                                    size="small"
                                    color="error"
                                    endIcon={<ArrowIcon />}
                                >
                                    {t('Traiter')}
                                </Button>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}

                    {/* Dead Stock */}
                    {deadStock.slice(0, 2).map((product, index) => (
                        <ListItem
                            key={`dead-${product.id || index}`}
                            sx={{
                                px: 0,
                                py: 1.5,
                                borderBottom: index < deadStock.slice(0, 2).length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 48 }}>
                                <Avatar
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: alpha(theme.palette.grey[500], 0.1),
                                    }}
                                >
                                    <DeadStockIcon sx={{ fontSize: 18, color: 'grey.500' }} />
                                </Avatar>
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 200 }}>
                                        {product.name}
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="caption" color="text.secondary">
                                        {t('Aucune vente depuis')} {product.days_since_sale || 90}+ {t('jours')} • Stock: {product.quantity}
                                    </Typography>
                                }
                            />
                            <ListItemSecondaryAction>
                                <Button
                                    component={Link}
                                    href={route('products.show', product.id)}
                                    size="small"
                                    color="inherit"
                                    endIcon={<ArrowIcon />}
                                >
                                    {t('Voir')}
                                </Button>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>

                {/* View All Links */}
                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                    {reorderSuggestions.length > 3 && (
                        <Button
                            component={Link}
                            href={route('replenishment.index')}
                            size="small"
                            variant="outlined"
                        >
                            {t('Voir toutes les suggestions')} ({reorderSuggestions.length})
                        </Button>
                    )}
                    {alerts.length > 2 && (
                        <Button
                            component={Link}
                            href={route('findings.index')}
                            size="small"
                            variant="outlined"
                            color="error"
                        >
                            {t('Voir toutes les alertes')} ({alerts.length})
                        </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}
