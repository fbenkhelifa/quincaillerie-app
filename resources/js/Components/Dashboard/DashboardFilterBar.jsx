/**
 * Dashboard Filter Bar
 * ====================
 * Global filter bar for dashboard analytics with date presets and dynamic filters.
 */

import { useState, useContext } from 'react';
import { router } from '@inertiajs/react';
import { AppContext } from '@/app';
import {
    Box,
    Paper,
    Grid,
    TextField,
    MenuItem,
    Button,
    ButtonGroup,
    Collapse,
    IconButton,
    Tooltip,
    Chip,
    alpha,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    Today as TodayIcon,
    DateRange as DateRangeIcon,
    ExpandMore as ExpandIcon,
    ExpandLess as CollapseIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';

const DATE_PRESETS = [
    { value: 'today', label: 'Aujourd\'hui', labelAr: 'اليوم' },
    { value: '7d', label: '7 jours', labelAr: '7 أيام' },
    { value: '30d', label: '30 jours', labelAr: '30 يوم' },
    { value: '90d', label: '90 jours', labelAr: '90 يوم' },
    { value: 'mtd', label: 'Ce mois', labelAr: 'هذا الشهر' },
    { value: 'ytd', label: 'Cette année', labelAr: 'هذه السنة' },
    { value: 'custom', label: 'Personnalisé', labelAr: 'مخصص' },
];

export default function DashboardFilterBar({
    currentFilters = {},
    filterOptions = {},
    onRefresh,
    loading = false,
}) {
    const { t, locale } = useContext(AppContext);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [expanded, setExpanded] = useState(false);
    const [filters, setFilters] = useState({
        date_preset: currentFilters.date_preset || '30d',
        start_date: currentFilters.start_date || '',
        end_date: currentFilters.end_date || '',
        worker_id: currentFilters.worker_id || '',
        payment_method: currentFilters.payment_method || '',
        category_id: currentFilters.category_id || '',
    });

    const showCustomDates = filters.date_preset === 'custom';
    const hasActiveFilters = filters.worker_id || filters.payment_method || filters.category_id;

    const handlePresetChange = (preset) => {
        const newFilters = { ...filters, date_preset: preset };
        setFilters(newFilters);
        applyFilters(newFilters);
    };

    const handleFilterChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
    };

    const applyFilters = (filtersToApply = filters) => {
        const params = {};
        Object.entries(filtersToApply).forEach(([key, value]) => {
            if (value) params[key] = value;
        });
        
        router.get(route('dashboard'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        const resetFilters = {
            date_preset: '30d',
            start_date: '',
            end_date: '',
            worker_id: '',
            payment_method: '',
            category_id: '',
        };
        setFilters(resetFilters);
        applyFilters(resetFilters);
    };

    const handleRefresh = () => {
        if (onRefresh) onRefresh();
        else applyFilters();
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
            }}
        >
            {/* Date Presets Row */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: expanded ? 2 : 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                    <DateRangeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <ButtonGroup size="small" variant="outlined">
                        {DATE_PRESETS.filter(p => p.value !== 'custom').map((preset) => (
                            <Button
                                key={preset.value}
                                onClick={() => handlePresetChange(preset.value)}
                                variant={filters.date_preset === preset.value ? 'contained' : 'outlined'}
                                sx={{ 
                                    minWidth: isMobile ? 'auto' : 80,
                                    px: isMobile ? 1 : 2,
                                }}
                            >
                                {locale === 'ar' ? preset.labelAr : preset.label}
                            </Button>
                        ))}
                    </ButtonGroup>
                </Box>

                <Box sx={{ flex: 1 }} />

                {/* Active Filter Chips */}
                {hasActiveFilters && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {filters.worker_id && (
                            <Chip
                                size="small"
                                label={filterOptions.workers?.find(w => w.value === parseInt(filters.worker_id))?.label || t('Ouvrier')}
                                onDelete={() => {
                                    const newFilters = { ...filters, worker_id: '' };
                                    setFilters(newFilters);
                                    applyFilters(newFilters);
                                }}
                            />
                        )}
                        {filters.payment_method && (
                            <Chip
                                size="small"
                                label={filterOptions.payment_methods?.find(p => p.value === filters.payment_method)?.label || filters.payment_method}
                                onDelete={() => {
                                    const newFilters = { ...filters, payment_method: '' };
                                    setFilters(newFilters);
                                    applyFilters(newFilters);
                                }}
                            />
                        )}
                        {filters.category_id && (
                            <Chip
                                size="small"
                                label={filterOptions.categories?.find(c => c.value === parseInt(filters.category_id))?.label || t('Catégorie')}
                                onDelete={() => {
                                    const newFilters = { ...filters, category_id: '' };
                                    setFilters(newFilters);
                                    applyFilters(newFilters);
                                }}
                            />
                        )}
                    </Box>
                )}

                {/* Action Buttons */}
                <Tooltip title={t('Plus de filtres')}>
                    <IconButton
                        size="small"
                        onClick={() => setExpanded(!expanded)}
                        sx={{
                            bgcolor: expanded ? 'action.selected' : 'transparent',
                        }}
                    >
                        <FilterIcon fontSize="small" />
                        {expanded ? <CollapseIcon sx={{ fontSize: 14, ml: -0.5 }} /> : <ExpandIcon sx={{ fontSize: 14, ml: -0.5 }} />}
                    </IconButton>
                </Tooltip>

                <Tooltip title={t('Actualiser')}>
                    <IconButton
                        size="small"
                        onClick={handleRefresh}
                        disabled={loading}
                        sx={{
                            animation: loading ? 'spin 1s linear infinite' : 'none',
                            '@keyframes spin': {
                                '0%': { transform: 'rotate(0deg)' },
                                '100%': { transform: 'rotate(360deg)' },
                            },
                        }}
                    >
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                {hasActiveFilters && (
                    <Tooltip title={t('Effacer les filtres')}>
                        <IconButton size="small" onClick={clearFilters}>
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            {/* Expanded Filters */}
            <Collapse in={expanded}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {/* Custom Date Range */}
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label={t('Date début')}
                            value={filters.start_date}
                            onChange={(e) => handleFilterChange('start_date', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label={t('Date fin')}
                            value={filters.end_date}
                            onChange={(e) => handleFilterChange('end_date', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {/* Worker Filter */}
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            size="small"
                            select
                            label={t('Ouvrier')}
                            value={filters.worker_id}
                            onChange={(e) => handleFilterChange('worker_id', e.target.value)}
                        >
                            <MenuItem value="">{t('Tous')}</MenuItem>
                            {filterOptions.workers?.map((worker) => (
                                <MenuItem key={worker.value} value={worker.value}>
                                    {worker.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Payment Method Filter */}
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            size="small"
                            select
                            label={t('Mode de paiement')}
                            value={filters.payment_method}
                            onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                        >
                            <MenuItem value="">{t('Tous')}</MenuItem>
                            {filterOptions.payment_methods?.map((method) => (
                                <MenuItem key={method.value} value={method.value}>
                                    {method.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Category Filter */}
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            size="small"
                            select
                            label={t('Catégorie')}
                            value={filters.category_id}
                            onChange={(e) => handleFilterChange('category_id', e.target.value)}
                        >
                            <MenuItem value="">{t('Toutes')}</MenuItem>
                            {filterOptions.categories?.map((category) => (
                                <MenuItem key={category.value} value={category.value}>
                                    {category.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Apply Button */}
                    <Grid item xs={12} display="flex" justifyContent="flex-end" gap={1}>
                        <Button variant="outlined" onClick={clearFilters}>
                            {t('Réinitialiser')}
                        </Button>
                        <Button variant="contained" onClick={() => applyFilters()}>
                            {t('Appliquer')}
                        </Button>
                    </Grid>
                </Grid>
            </Collapse>
        </Paper>
    );
}
