/**
 * ProDataTable Component
 * ======================
 * Premium reusable data table with server-side pagination/sort/filter,
 * column presets, saved views, and world-class UX.
 *
 * Features:
 * - Server-side pagination, sorting, and filtering
 * - Column presets (Compact/Comfortable)
 * - Saved views with localStorage
 * - Filter chips with Clear All button
 * - Skeleton loading states
 * - Empty states with actions
 * - CSV export support
 * - Responsive design
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Typography,
  Chip,
  Button,
  Divider,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  alpha,
  useTheme,
  useMediaQuery,
  Fade,
} from '@mui/material';
import {
  ViewColumn as ViewColumnIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  Tune as TuneIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  SwapVert as SortIcon,
} from '@mui/icons-material';
import { EmptyState } from './index';
import { TableSkeleton } from './LoadingState';

const PRESET_KEYS = {
  COMPACT: 'compact',
  COMFORTABLE: 'comfortable',
};

/**
 * Main ProDataTable Component
 */
export default function ProDataTable({
  columns = [],
  rows = [],
  loading = false,
  page = 0,
  pageSize = 10,
  totalRows = 0,
  onPageChange = () => {},
  onPageSizeChange = () => {},
  onSort = () => {},
  onFilterChange = () => {},
  sortBy = null,
  sortOrder = 'asc',
  filters = {},
  emptyStateTitle = 'No data',
  emptyStateDescription = 'Get started by adding your first item',
  emptyStateAction = null,
  enableColumnVisibility = true,
  enableExport = false,
  onExport = null,
  enableSearch = false,
  onSearch = null,
  tableKey = 'default', // For saving user preferences per table
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [preset, setPreset] = useState(() => {
    try {
      return localStorage.getItem(`table_preset_${tableKey}`) || PRESET_KEYS.COMFORTABLE;
    } catch {
      return PRESET_KEYS.COMFORTABLE;
    }
  });
  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const saved = localStorage.getItem(`table_columns_${tableKey}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return columns.filter(c => c.visible !== false).map(c => c.id);
  });
  const [columnSettingsAnchor, setColumnSettingsAnchor] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState(filters);

  // Persist column visibility
  useEffect(() => {
    try {
      localStorage.setItem(`table_columns_${tableKey}`, JSON.stringify(visibleColumns));
    } catch {}
  }, [visibleColumns, tableKey]);

  // Persist preset
  useEffect(() => {
    try {
      localStorage.setItem(`table_preset_${tableKey}`, preset);
    } catch {}
  }, [preset, tableKey]);

  const handlePresetChange = (newPreset) => {
    setPreset(newPreset);
  };

  const handleColumnVisibilityToggle = (columnId) => {
    setVisibleColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleSelectAllColumns = () => {
    setVisibleColumns(columns.map((c) => c.id));
  };

  const handleClearAllColumns = () => {
    const required = columns.filter((c) => c.alwaysVisible).map((c) => c.id);
    setVisibleColumns(required);
  };

  const handleSort = (columnId) => {
    const field = columns.find((c) => c.id === columnId)?.field || columnId;
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(field, newOrder);
  };

  const handleSearch = useCallback(
    (value) => {
      setSearchValue(value);
      if (onSearch) {
        onSearch(value);
      }
    },
    [onSearch]
  );

  const handleFilterChange = useCallback(
    (filterId, value) => {
      const updated = { ...activeFilters, [filterId]: value };
      if (!value) {
        delete updated[filterId];
      }
      setActiveFilters(updated);
      if (onFilterChange) {
        onFilterChange(updated);
      }
    },
    [activeFilters, onFilterChange]
  );

  const handleClearFilters = () => {
    setActiveFilters({});
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      exportToCSV();
    }
  };

  const visibleColsData = useMemo(
    () => columns.filter((c) => visibleColumns.includes(c.id)),
    [columns, visibleColumns]
  );

  const rowHeight = preset === PRESET_KEYS.COMPACT ? 44 : 56;

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  // CSV Export helper
  const exportToCSV = () => {
    try {
      const headers = visibleColsData.map((c) => c.label).join(',');
      const csvRows = rows.map((row) =>
        visibleColsData
          .map((col) => {
            const value = row[col.field] || '';
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            return `"${stringValue.replace(/"/g, '""')}"`;
          })
          .join(',')
      );
      const csv = [headers, ...csvRows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return <TableSkeleton rows={pageSize} />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      {/* Search + Filter Toolbar */}
      <Stack
        spacing={2}
        sx={{
          flexWrap: 'wrap',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <Stack spacing={1} sx={{ flex: 1, minWidth: 200 }}>
          {enableSearch && (
            <TextField
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              size="small"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
              }}
            />
          )}

          {/* Filter Chips Row */}
          {hasActiveFilters && (
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
              {Object.entries(activeFilters).map(([key, value]) => (
                <Chip
                  key={key}
                  label={`${key}: ${value}`}
                  onDelete={() => handleFilterChange(key, null)}
                  size="small"
                  variant="outlined"
                  icon={<FilterListIcon />}
                />
              ))}
              <Button
                size="small"
                variant="text"
                color="error"
                onClick={handleClearFilters}
              >
                Clear All
              </Button>
            </Stack>
          )}
        </Stack>

        {/* Actions Toolbar */}
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          {enableExport && (
            <Tooltip title="Export as CSV">
              <IconButton size="small" onClick={handleExport} aria-label="Export">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          )}

          {enableColumnVisibility && (
            <>
              <Tooltip title="Column settings">
                <IconButton
                  size="small"
                  onClick={(e) => setColumnSettingsAnchor(e.currentTarget)}
                  aria-label="Column settings"
                >
                  <ViewColumnIcon />
                </IconButton>
              </Tooltip>

              {/* Column Visibility Menu */}
              <Menu
                anchorEl={columnSettingsAnchor}
                open={Boolean(columnSettingsAnchor)}
                onClose={() => setColumnSettingsAnchor(null)}
                PaperProps={{
                  sx: {
                    minWidth: 250,
                    maxHeight: 400,
                    maxWidth: 300,
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Columns
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Select all">
                      <IconButton size="small" onClick={handleSelectAllColumns}>
                        <SaveIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Clear">
                      <IconButton size="small" onClick={handleClearAllColumns}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
                <Divider />

                {/* Presets */}
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', color: 'text.secondary' }}>
                    Presets
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    <Button
                      size="small"
                      variant={preset === PRESET_KEYS.COMPACT ? 'contained' : 'outlined'}
                      onClick={() => handlePresetChange(PRESET_KEYS.COMPACT)}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Compact
                    </Button>
                    <Button
                      size="small"
                      variant={preset === PRESET_KEYS.COMFORTABLE ? 'contained' : 'outlined'}
                      onClick={() => handlePresetChange(PRESET_KEYS.COMFORTABLE)}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Comfortable
                    </Button>
                  </Stack>
                </Box>

                <Divider />

                {/* Column List */}
                <List dense sx={{ maxHeight: 250, overflow: 'auto' }}>
                  {columns.map((column) => (
                    <ListItem
                      key={column.id}
                      secondaryAction={
                        !column.alwaysVisible && (
                          <Checkbox
                            edge="end"
                            size="small"
                            checked={visibleColumns.includes(column.id)}
                            onChange={() => handleColumnVisibilityToggle(column.id)}
                            tabIndex={-1}
                          />
                        )
                      }
                      disablePadding
                      sx={{ pl: 2 }}
                    >
                      <ListItemText
                        primary={column.label}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Menu>
            </>
          )}
        </Stack>
      </Stack>

      {/* Data Table */}
      {rows.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <EmptyState
            title={emptyStateTitle}
            description={emptyStateDescription}
            action={emptyStateAction}
          />
        </Paper>
      ) : (
        <Fade in={!loading}>
          <TableContainer component={Paper} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Table stickyHeader sx={{ minWidth: isMobile ? 300 : 'auto' }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                  {visibleColsData.map((column) => (
                    <TableCell
                      key={column.id}
                      sortDirection={sortBy === column.field ? sortOrder : false}
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                        height: rowHeight,
                      }}
                    >
                      {column.sortable ? (
                        <TableSortLabel
                          active={sortBy === column.field}
                          direction={sortBy === column.field ? sortOrder : 'asc'}
                          onClick={() => handleSort(column.id)}
                        >
                          {column.label}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, idx) => (
                  <TableRow
                    key={row.id || idx}
                    hover
                    sx={{
                      height: rowHeight,
                      '&:last-child td': {
                        borderBottom: 0,
                      },
                    }}
                  >
                    {visibleColsData.map((column) => (
                      <TableCell
                        key={column.id}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: column.wrap ? 'normal' : 'nowrap',
                          maxWidth: column.maxWidth || 300,
                        }}
                      >
                        {column.render ? column.render(row[column.field], row) : row[column.field]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Fade>
      )}

      {/* Pagination */}
      {rows.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={totalRows}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={(e, newPage) => onPageChange(newPage)}
          onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
          sx={{
            mt: 'auto',
          }}
        />
      )}
    </Box>
  );
}
