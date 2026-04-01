/**
 * Dashboard Charts
 * ================
 * Premium Recharts-based chart components for dashboard analytics.
 */

import { useContext, useState } from 'react';
import { AppContext } from '@/app';
import {
    Box,
    Card,
    CardContent,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    Skeleton,
    alpha,
    useTheme,
} from '@mui/material';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';

// Color palette
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

/**
 * Custom Tooltip for all charts
 */
function CustomTooltip({ active, payload, label, formatter, theme }) {
    if (!active || !payload?.length) return null;

    return (
        <Box
            sx={{
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 1.5,
                boxShadow: theme.shadows[8],
            }}
        >
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                {label}
            </Typography>
            {payload.map((entry, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: entry.color,
                        }}
                    />
                    <Typography variant="body2" fontWeight={500}>
                        {entry.name}: {formatter ? formatter(entry.value) : entry.value}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}

/**
 * Revenue Timeline Chart
 */
export function RevenueTimelineChart({ data = [], loading = false, title }) {
    const { t, locale } = useContext(AppContext);
    const theme = useTheme();
    const [chartType, setChartType] = useState('area');

    const formatCurrency = (value) =>
        new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
            style: 'decimal',
            maximumFractionDigits: 0,
        }).format(value) + ' DA';

    if (loading) {
        return (
            <Card sx={{ height: '100%' }}>
                <CardContent>
                    <Skeleton variant="text" width={150} height={24} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={300} />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                        {title || t('Évolution du chiffre d\'affaires')}
                    </Typography>
                    <ToggleButtonGroup
                        size="small"
                        value={chartType}
                        exclusive
                        onChange={(_, v) => v && setChartType(v)}
                    >
                        <ToggleButton value="area">Area</ToggleButton>
                        <ToggleButton value="line">Line</ToggleButton>
                        <ToggleButton value="bar">Bar</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <ResponsiveContainer width="100%" height={300}>
                    {chartType === 'bar' ? (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                            <Tooltip content={<CustomTooltip theme={theme} formatter={formatCurrency} />} />
                            <Bar dataKey="revenue" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    ) : chartType === 'line' ? (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                            <Tooltip content={<CustomTooltip theme={theme} formatter={formatCurrency} />} />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke={theme.palette.primary.main}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    ) : (
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                            <Tooltip content={<CustomTooltip theme={theme} formatter={formatCurrency} />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke={theme.palette.primary.main}
                                strokeWidth={2}
                                fill="url(#revenueGradient)"
                            />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

/**
 * Payment Methods Pie Chart
 */
export function PaymentMethodsChart({ data = [], loading = false, title }) {
    const { t, locale } = useContext(AppContext);
    const theme = useTheme();

    const formatCurrency = (value) =>
        new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
            style: 'decimal',
            maximumFractionDigits: 0,
        }).format(value) + ' DA';

    if (loading) {
        return (
            <Card sx={{ height: '100%' }}>
                <CardContent>
                    <Skeleton variant="text" width={150} height={24} sx={{ mb: 2 }} />
                    <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
                </CardContent>
            </Card>
        );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                    {title || t('Modes de paiement')}
                </Typography>

                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke={theme.palette.background.paper}
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{
                                backgroundColor: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 8,
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mt: 1 }}>
                    {data.map((entry, index) => (
                        <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: 0.5,
                                    bgcolor: COLORS[index % COLORS.length],
                                }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                {entry.name}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
}

/**
 * Top Products Chart with Pareto line
 */
export function TopProductsChart({ data = [], loading = false, title }) {
    const { t, locale } = useContext(AppContext);
    const theme = useTheme();

    const formatCurrency = (value) =>
        new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
            style: 'decimal',
            maximumFractionDigits: 0,
        }).format(value) + ' DA';

    if (loading) {
        return (
            <Card sx={{ height: '100%' }}>
                <CardContent>
                    <Skeleton variant="text" width={150} height={24} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={300} />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                    {title || t('Top 10 produits')}
                </Typography>

                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
                        <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} width={100} />
                        <Tooltip content={<CustomTooltip theme={theme} formatter={formatCurrency} />} />
                        <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                        {data.some(d => d.cumulative_percent) && (
                            <Line
                                type="monotone"
                                dataKey="cumulative_percent"
                                stroke={theme.palette.error.main}
                                strokeWidth={2}
                                dot={false}
                                yAxisId="right"
                            />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

/**
 * Stock Risk by Category Chart
 */
export function StockRiskChart({ data = [], loading = false, title }) {
    const { t } = useContext(AppContext);
    const theme = useTheme();

    if (loading) {
        return (
            <Card sx={{ height: '100%' }}>
                <CardContent>
                    <Skeleton variant="text" width={150} height={24} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={300} />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                    {title || t('Risque de rupture par catégorie')}
                </Typography>

                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke={theme.palette.text.secondary} />
                        <YAxis tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 8,
                            }}
                        />
                        <Legend />
                        <Bar dataKey="healthy" name={t('Stock OK')} stackId="a" fill={theme.palette.success.main} />
                        <Bar dataKey="low_stock" name={t('Stock bas')} stackId="a" fill={theme.palette.warning.main} />
                        <Bar dataKey="out_of_stock" name={t('Rupture')} stackId="a" fill={theme.palette.error.main} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

/**
 * Inventory Movements Timeline
 */
export function MovementsTimelineChart({ data = [], loading = false, title }) {
    const { t } = useContext(AppContext);
    const theme = useTheme();

    if (loading) {
        return (
            <Card sx={{ height: '100%' }}>
                <CardContent>
                    <Skeleton variant="text" width={150} height={24} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={300} />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                    {title || t('Mouvements de stock')}
                </Typography>

                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="inGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="outGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                        <YAxis tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 8,
                            }}
                        />
                        <Legend />
                        <ReferenceLine y={0} stroke={theme.palette.divider} />
                        <Area
                            type="monotone"
                            dataKey="purchases"
                            name={t('Entrées')}
                            stroke={theme.palette.success.main}
                            fill="url(#inGradient)"
                            stackId="1"
                        />
                        <Area
                            type="monotone"
                            dataKey="sales"
                            name={t('Sorties')}
                            stroke={theme.palette.error.main}
                            fill="url(#outGradient)"
                            stackId="2"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

/**
 * Alerts by Severity Chart
 */
export function AlertsSeverityChart({ data = [], loading = false, title }) {
    const { t } = useContext(AppContext);
    const theme = useTheme();

    const severityColors = {
        critical: theme.palette.error.main,
        high: '#f97316',
        medium: theme.palette.warning.main,
        low: theme.palette.info.main,
    };

    if (loading) {
        return (
            <Card sx={{ height: '100%' }}>
                <CardContent>
                    <Skeleton variant="text" width={150} height={24} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={250} />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                    {title || t('Alertes par sévérité')}
                </Typography>

                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                        <YAxis tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 8,
                            }}
                        />
                        <Legend />
                        <Bar dataKey="critical" name={t('Critique')} stackId="a" fill={severityColors.critical} />
                        <Bar dataKey="high" name={t('Haute')} stackId="a" fill={severityColors.high} />
                        <Bar dataKey="medium" name={t('Moyenne')} stackId="a" fill={severityColors.medium} />
                        <Bar dataKey="low" name={t('Basse')} stackId="a" fill={severityColors.low} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
