import { useContext, useState, useCallback } from 'react';
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Chip,
    OutlinedInput,
    Paper,
    Grid,
    IconButton,
    Collapse,
    InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { router } from '@inertiajs/react';
import debounce from 'lodash.debounce';
import dayjs from 'dayjs';
import { AppContext } from '../app';

export default function Filters({
    filters,
    categories = [],
    suppliers = [],
    route: routeName,
}) {
    const { t, locale } = useContext(AppContext);
    const [expanded, setExpanded] = useState(false);
    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
        category_id: filters.category_id || [],
        supplier_id: filters.supplier_id || [],
        stock_status: filters.stock_status || '',
        min_price: filters.min_price || '',
        max_price: filters.max_price || '',
        date_from: filters.date_from ? dayjs(filters.date_from) : null,
        date_to: filters.date_to ? dayjs(filters.date_to) : null,
    });

    const applyFilters = useCallback(
        debounce((newFilters) => {
            const queryParams = {};
            
            Object.keys(newFilters).forEach((key) => {
                const value = newFilters[key];
                if (value && value !== '' && (!Array.isArray(value) || value.length > 0)) {
                    if (value instanceof dayjs) {
                        queryParams[key] = value.format('YYYY-MM-DD');
                    } else {
                        queryParams[key] = value;
                    }
                }
            });

            router.get(route(routeName), queryParams, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 300),
        [routeName]
    );

    const handleChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        
        if (key === 'search') {
            applyFilters(newFilters);
        }
    };

    const handleApply = () => {
        applyFilters(localFilters);
    };

    const handleClear = () => {
        const clearedFilters = {
            search: '',
            category_id: [],
            supplier_id: [],
            stock_status: '',
            min_price: '',
            max_price: '',
            date_from: null,
            date_to: null,
        };
        setLocalFilters(clearedFilters);
        router.get(route(routeName), {}, { preserveState: true });
    };

    const hasActiveFilters = Object.values(localFilters).some(
        (v) => v && v !== '' && (!Array.isArray(v) || v.length > 0)
    );

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: expanded ? 2 : 0 }}>
                <TextField
                    placeholder={t('Rechercher par nom, code-barres, SKU...')}
                    value={localFilters.search}
                    onChange={(e) => handleChange('search', e.target.value)}
                    sx={{ flexGrow: 1 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        endAdornment: localFilters.search && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => handleChange('search', '')}>
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <Button
                    variant={expanded ? 'contained' : 'outlined'}
                    startIcon={<FilterIcon />}
                    endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    onClick={() => setExpanded(!expanded)}
                >
                    {t('Filtres')}
                    {hasActiveFilters && (
                        <Chip
                            size="small"
                            label="!"
                            color="primary"
                            sx={{ ml: 1, height: 20, minWidth: 20 }}
                        />
                    )}
                </Button>

                {hasActiveFilters && (
                    <Button variant="text" startIcon={<ClearIcon />} onClick={handleClear}>
                        {t('Effacer')}
                    </Button>
                )}
            </Box>

            <Collapse in={expanded}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>{t('Catégorie')}</InputLabel>
                            <Select
                                multiple
                                value={localFilters.category_id}
                                onChange={(e) => handleChange('category_id', e.target.value)}
                                input={<OutlinedInput label={t('Catégorie')} />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const cat = categories.find((c) => c.id === value);
                                            return (
                                                <Chip
                                                    key={value}
                                                    label={locale === 'ar' && cat?.name_ar ? cat.name_ar : cat?.name}
                                                    size="small"
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                            >
                                {categories.map((category) => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {locale === 'ar' && category.name_ar ? category.name_ar : category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>{t('Fournisseur')}</InputLabel>
                            <Select
                                multiple
                                value={localFilters.supplier_id}
                                onChange={(e) => handleChange('supplier_id', e.target.value)}
                                input={<OutlinedInput label={t('Fournisseur')} />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const sup = suppliers.find((s) => s.id === value);
                                            return <Chip key={value} label={sup?.name} size="small" />;
                                        })}
                                    </Box>
                                )}
                            >
                                {suppliers.map((supplier) => (
                                    <MenuItem key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>{t('État du stock')}</InputLabel>
                            <Select
                                value={localFilters.stock_status}
                                onChange={(e) => handleChange('stock_status', e.target.value)}
                                label={t('État du stock')}
                            >
                                <MenuItem value="">{t('Tous')}</MenuItem>
                                <MenuItem value="available">{t('Disponible')}</MenuItem>
                                <MenuItem value="low">{t('Stock bas')}</MenuItem>
                                <MenuItem value="out">{t('Rupture')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                label={t('Prix min')}
                                type="number"
                                size="small"
                                value={localFilters.min_price}
                                onChange={(e) => handleChange('min_price', e.target.value)}
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                label={t('Prix max')}
                                type="number"
                                size="small"
                                value={localFilters.max_price}
                                onChange={(e) => handleChange('max_price', e.target.value)}
                                sx={{ flex: 1 }}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <DatePicker
                            label={t('Date de début')}
                            value={localFilters.date_from}
                            onChange={(value) => handleChange('date_from', value)}
                            slotProps={{
                                textField: { size: 'small', fullWidth: true },
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <DatePicker
                            label={t('Date de fin')}
                            value={localFilters.date_to}
                            onChange={(value) => handleChange('date_to', value)}
                            slotProps={{
                                textField: { size: 'small', fullWidth: true },
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button variant="contained" onClick={handleApply}>
                                {t('Appliquer les filtres')}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Collapse>
        </Paper>
    );
}
