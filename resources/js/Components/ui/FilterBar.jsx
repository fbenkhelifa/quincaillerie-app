/**
 * FilterBar Component
 * ===================
 * Advanced filter bar with search, filter chips, presets, and date range support.
 */

import { useState, useCallback, useContext, useMemo, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Collapse,
  Grid,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Badge,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkFilledIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { router } from '@inertiajs/react';
import debounce from 'lodash.debounce';
import dayjs from 'dayjs';
import { AppContext } from '../../app';

// Local storage key for saved presets
const PRESETS_STORAGE_KEY = 'filter_presets';

/**
 * FilterPresetManager - Manages saved filter presets
 */
function FilterPresetManager({ routeName, filters, onApplyPreset, t }) {
  const [presets, setPresets] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState('');

  // Load presets from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${PRESETS_STORAGE_KEY}_${routeName}`);
      if (stored) {
        setPresets(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load filter presets:', e);
    }
  }, [routeName]);

  const savePresets = (newPresets) => {
    setPresets(newPresets);
    localStorage.setItem(`${PRESETS_STORAGE_KEY}_${routeName}`, JSON.stringify(newPresets));
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    
    const newPreset = {
      id: Date.now(),
      name: presetName.trim(),
      filters: { ...filters },
    };
    
    savePresets([...presets, newPreset]);
    setPresetName('');
    setSaveDialogOpen(false);
  };

  const handleDeletePreset = (id) => {
    savePresets(presets.filter(p => p.id !== id));
  };

  const handleApplyPreset = (preset) => {
    onApplyPreset(preset.filters);
    setAnchorEl(null);
  };

  const hasActiveFilters = Object.values(filters).some(
    v => v && v !== '' && (!Array.isArray(v) || v.length > 0)
  );

  return (
    <>
      <Tooltip title={t('Filtres enregistrés')}>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label={t('Filter presets')}
        >
          <Badge badgeContent={presets.length} color="primary" max={9}>
            {presets.length > 0 ? <BookmarkFilledIcon /> : <BookmarkIcon />}
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { minWidth: 240, maxHeight: 400 } }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {t('Filtres enregistrés')}
          </Typography>
          {hasActiveFilters && (
            <Tooltip title={t('Enregistrer les filtres actuels')}>
              <IconButton size="small" onClick={() => setSaveDialogOpen(true)}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Divider />
        
        {presets.length === 0 ? (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('Aucun filtre enregistré')}
            </Typography>
          </Box>
        ) : (
          presets.map((preset) => (
            <MenuItem
              key={preset.id}
              sx={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <ListItemText
                primary={preset.name}
                onClick={() => handleApplyPreset(preset)}
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePreset(preset.id);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </MenuItem>
          ))
        )}
      </Menu>

      {/* Save Preset Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('Enregistrer le filtre')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={t('Nom du filtre')}
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder={t('Ex: Produits en rupture')}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)} color="inherit">
            {t('Annuler')}
          </Button>
          <Button onClick={handleSavePreset} variant="contained" disabled={!presetName.trim()}>
            {t('Enregistrer')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/**
 * ActiveFilterChips - Shows active filters as chips
 */
function ActiveFilterChips({ filters, filterConfig, onRemove, onClear, t }) {
  const theme = useTheme();
  
  const activeFilters = useMemo(() => {
    const active = [];
    
    Object.entries(filters).forEach(([key, value]) => {
      if (!value || value === '' || (Array.isArray(value) && value.length === 0)) return;
      
      const config = filterConfig.find(f => f.id === key);
      if (!config) return;

      if (Array.isArray(value)) {
        value.forEach(v => {
          const option = config.options?.find(o => o.value === v);
          active.push({
            key,
            value: v,
            label: `${config.label}: ${option?.label || v}`,
          });
        });
      } else if (value instanceof dayjs) {
        active.push({
          key,
          value,
          label: `${config.label}: ${value.format('DD/MM/YYYY')}`,
        });
      } else {
        const option = config.options?.find(o => o.value === value);
        active.push({
          key,
          value,
          label: `${config.label}: ${option?.label || value}`,
        });
      }
    });
    
    return active;
  }, [filters, filterConfig]);

  if (activeFilters.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
      {activeFilters.map((filter, index) => (
        <Chip
          key={`${filter.key}-${filter.value}-${index}`}
          label={filter.label}
          onDelete={() => onRemove(filter.key, filter.value)}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            fontWeight: 500,
            '& .MuiChip-deleteIcon': {
              color: 'primary.main',
              '&:hover': {
                color: 'primary.dark',
              },
            },
          }}
        />
      ))}
      <Chip
        label={t('Tout effacer')}
        onClick={onClear}
        size="small"
        variant="outlined"
        sx={{ fontWeight: 500 }}
      />
    </Box>
  );
}

/**
 * FilterBar main component
 */
export default function FilterBar({
  filters = {},
  filterConfig = [],
  routeName,
  onFilterChange,
  searchPlaceholder,
  showDateRange = false,
  showPresets = true,
  sx = {},
}) {
  const theme = useTheme();
  const { t } = useContext(AppContext) || { t: (key) => key };
  
  const [expanded, setExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(() => {
    const initial = { search: filters.search || '' };
    filterConfig.forEach(config => {
      initial[config.id] = filters[config.id] || (config.multiple ? [] : '');
    });
    if (showDateRange) {
      initial.date_from = filters.date_from ? dayjs(filters.date_from) : null;
      initial.date_to = filters.date_to ? dayjs(filters.date_to) : null;
    }
    return initial;
  });

  // Debounced filter application
  const applyFilters = useCallback(
    debounce((newFilters) => {
      const queryParams = {};
      
      Object.entries(newFilters).forEach(([key, value]) => {
        if (!value || value === '' || (Array.isArray(value) && value.length === 0)) return;
        
        if (value instanceof dayjs && value.isValid()) {
          queryParams[key] = value.format('YYYY-MM-DD');
        } else {
          queryParams[key] = value;
        }
      });

      if (onFilterChange) {
        onFilterChange(queryParams);
      } else {
        router.get(route(routeName), queryParams, {
          preserveState: true,
          preserveScroll: true,
        });
      }
    }, 400),
    [routeName, onFilterChange]
  );

  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    
    // Apply search immediately with debounce
    if (key === 'search') {
      applyFilters(newFilters);
    }
  };

  const handleApplyFilters = () => {
    applyFilters(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = { search: '' };
    filterConfig.forEach(config => {
      clearedFilters[config.id] = config.multiple ? [] : '';
    });
    if (showDateRange) {
      clearedFilters.date_from = null;
      clearedFilters.date_to = null;
    }
    
    setLocalFilters(clearedFilters);
    
    if (onFilterChange) {
      onFilterChange({});
    } else {
      router.get(route(routeName), {}, { preserveState: true });
    }
  };

  const handleRemoveFilter = (key, value) => {
    const currentValue = localFilters[key];
    let newValue;
    
    if (Array.isArray(currentValue)) {
      newValue = currentValue.filter(v => v !== value);
    } else {
      newValue = '';
    }
    
    const newFilters = { ...localFilters, [key]: newValue };
    setLocalFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleApplyPreset = (presetFilters) => {
    const newFilters = { search: '' };
    filterConfig.forEach(config => {
      newFilters[config.id] = config.multiple ? [] : '';
    });
    if (showDateRange) {
      newFilters.date_from = null;
      newFilters.date_to = null;
    }
    
    Object.entries(presetFilters).forEach(([key, value]) => {
      if (key === 'date_from' || key === 'date_to') {
        newFilters[key] = value ? dayjs(value) : null;
      } else {
        newFilters[key] = value;
      }
    });
    
    setLocalFilters(newFilters);
    applyFilters(newFilters);
  };

  const hasActiveFilters = useMemo(() => {
    return Object.entries(localFilters).some(([key, value]) => {
      if (key === 'search') return false; // Don't count search in active filters count
      if (!value) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (value instanceof dayjs) return value.isValid();
      return value !== '';
    });
  }, [localFilters]);

  const activeFilterCount = useMemo(() => {
    return Object.entries(localFilters).filter(([key, value]) => {
      if (key === 'search') return false;
      if (!value) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (value instanceof dayjs) return value.isValid();
      return value !== '';
    }).length;
  }, [localFilters]);

  return (
    <Paper sx={{ p: 2.5, mb: 3, ...sx }}>
      {/* Main Search Row */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder={searchPlaceholder || t('Rechercher...')}
          value={localFilters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: localFilters.search && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => handleChange('search', '')}
                  aria-label={t('Clear search')}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {filterConfig.length > 0 && (
          <Button
            variant={expanded ? 'contained' : 'outlined'}
            startIcon={<FilterListIcon />}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setExpanded(!expanded)}
            sx={{ flexShrink: 0 }}
          >
            {t('Filtres')}
            {activeFilterCount > 0 && (
              <Chip
                size="small"
                label={activeFilterCount}
                color="primary"
                sx={{ ml: 1, height: 20, minWidth: 20, fontSize: '0.75rem' }}
              />
            )}
          </Button>
        )}

        {showPresets && (
          <FilterPresetManager
            routeName={routeName}
            filters={localFilters}
            onApplyPreset={handleApplyPreset}
            t={t}
          />
        )}

        {hasActiveFilters && (
          <Tooltip title={t('Effacer tous les filtres')}>
            <IconButton onClick={handleClearFilters} aria-label={t('Clear all filters')}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Expanded Filters */}
      <Collapse in={expanded}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {filterConfig.map((config) => (
            <Grid item xs={12} sm={6} md={config.width || 3} key={config.id}>
              {config.type === 'select' ? (
                <FormControl fullWidth size="small">
                  <InputLabel>{config.label}</InputLabel>
                  <Select
                    value={localFilters[config.id] || (config.multiple ? [] : '')}
                    onChange={(e) => handleChange(config.id, e.target.value)}
                    label={config.label}
                    multiple={config.multiple}
                    renderValue={config.multiple ? (selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={config.options.find(o => o.value === value)?.label || value}
                            size="small"
                          />
                        ))}
                      </Box>
                    ) : undefined}
                  >
                    {!config.multiple && <MenuItem value="">{t('Tous')}</MenuItem>}
                    {config.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : config.type === 'text' ? (
                <TextField
                  fullWidth
                  size="small"
                  label={config.label}
                  value={localFilters[config.id] || ''}
                  onChange={(e) => handleChange(config.id, e.target.value)}
                />
              ) : null}
            </Grid>
          ))}

          {showDateRange && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label={t('Du')}
                  value={localFilters.date_from}
                  onChange={(value) => handleChange('date_from', value)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label={t('Au')}
                  value={localFilters.date_to}
                  onChange={(value) => handleChange('date_to', value)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button variant="outlined" onClick={handleClearFilters}>
                {t('Réinitialiser')}
              </Button>
              <Button variant="contained" onClick={handleApplyFilters}>
                {t('Appliquer')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Collapse>

      {/* Active Filter Chips */}
      <ActiveFilterChips
        filters={localFilters}
        filterConfig={[
          ...filterConfig,
          ...(showDateRange ? [
            { id: 'date_from', label: t('Du') },
            { id: 'date_to', label: t('Au') },
          ] : []),
        ]}
        onRemove={handleRemoveFilter}
        onClear={handleClearFilters}
        t={t}
      />
    </Paper>
  );
}
