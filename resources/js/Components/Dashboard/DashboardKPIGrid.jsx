/**
 * Dashboard KPI Grid
 * ==================
 * Premium KPI cards with trend indicators and sparklines.
 */

import { useContext } from 'react';
import { AppContext } from '@/app';
import { Grid, Box, Typography, alpha, useTheme, Skeleton } from '@mui/material';
import { StatCard } from '@/Components/ui';
import {
    TrendingUp as TrendingUpIcon,
    Receipt as ReceiptIcon,
    ShoppingCart as CartIcon,
    Inventory as InventoryIcon,
    Warning as WarningIcon,
    MonetizationOn as ProfitIcon,
} from '@mui/icons-material';

const KPI_CONFIG = {
    revenue: {
        icon: TrendingUpIcon,
        color: 'success',
        formatType: 'currency',
        titleKey: 'Chiffre d\'affaires',
    },
    bills_count: {
        icon: ReceiptIcon,
        color: 'primary',
        formatType: 'number',
        titleKey: 'Factures',
    },
    avg_basket: {
        icon: CartIcon,
        color: 'info',
        formatType: 'currency',
        titleKey: 'Panier moyen',
    },
    items_sold: {
        icon: InventoryIcon,
        color: 'secondary',
        formatType: 'number',
        titleKey: 'Articles vendus',
    },
    low_stock: {
        icon: WarningIcon,
        color: 'warning',
        formatType: 'number',
        titleKey: 'Stock bas',
    },
    gross_margin: {
        icon: ProfitIcon,
        color: 'success',
        formatType: 'percent',
        titleKey: 'Marge brute',
    },
};

export default function DashboardKPIGrid({ kpis = [], loading = false }) {
    const { t, locale } = useContext(AppContext);
    const theme = useTheme();

    const formatValue = (value, formatType) => {
        if (value === null || value === undefined) return '-';
        
        switch (formatType) {
            case 'currency':
                return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
                    style: 'decimal',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(value) + ' DA';
            case 'percent':
                return `${value.toFixed(1)}%`;
            case 'number':
            default:
                return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ').format(value);
        }
    };

    if (loading) {
        return (
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[...Array(6)].map((_, i) => (
                    <Grid item xs={12} sm={6} lg={4} xl={2} key={i}>
                        <StatCard loading />
                    </Grid>
                ))}
            </Grid>
        );
    }

    return (
        <Grid container spacing={2} sx={{ mb: 3 }}>
            {kpis.map((kpi, index) => {
                const config = KPI_CONFIG[kpi.key] || {
                    icon: TrendingUpIcon,
                    color: 'primary',
                    formatType: 'number',
                    titleKey: kpi.label,
                };
                const IconComponent = config.icon;

                return (
                    <Grid item xs={12} sm={6} lg={4} xl={2} key={kpi.key || index}>
                        <StatCard
                            title={t(config.titleKey)}
                            value={formatValue(kpi.value, config.formatType)}
                            icon={<IconComponent sx={{ fontSize: 28 }} />}
                            color={config.color}
                            trend={kpi.trend_percent}
                            sparklineData={kpi.sparkline}
                            subtitle={kpi.comparison_label ? t(kpi.comparison_label) : null}
                            sx={{
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: theme.shadows[8],
                                },
                            }}
                        />
                    </Grid>
                );
            })}
        </Grid>
    );
}
