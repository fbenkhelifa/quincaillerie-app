/**
 * DataTable Component
 * ===================
 * Enhanced data table with column visibility toggle, better UX, and accessibility.
 */

import { useState, useMemo, useCallback, useContext } from 'react';
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
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Button,
  Divider,
  FormControlLabel,
  Switch,
  alpha,
  useTheme,
} from '@mui/material';
import {
  ViewColumn as ViewColumnIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import EmptyState from './EmptyState';
import { TableSkeleton } from './LoadingState';
import { AppContext } from '../../app';

/**
 * ColumnVisibilityMenu - Toggle column visibility
 */
function ColumnVisibilityMenu({ columns, visibleColumns, onToggle, t }) {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <>
      <Tooltip title={t ? t('Colonnes') : 'Columns'}>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label={t ? t('Toggle column visibility') : 'Toggle column visibility'}
        >
          <ViewColumnIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { minWidth: 200, maxHeight: 400 } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {t ? t('Colonnes visibles') : 'Visible Columns'}
          </Typography>
        </Box>
        <Divider />
        {columns.filter(col => !col.alwaysVisible).map((column) => (
          <MenuItem
            key={column.id}
            onClick={() => onToggle(column.id)}
            dense
          >
            <Checkbox
              checked={visibleColumns.includes(column.id)}
              size="small"
              tabIndex={-1}
            />
            <ListItemText primary={column.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

/**
 * DataTable main component
 */
export default function DataTable({
  columns,
  data = [],
  loading = false,
  emptyState,
  
  // Pagination
  pagination = true,
  totalCount,
  page = 0,
  rowsPerPage = 25,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50, 100],
  serverPagination = false,

  // Sorting
  sortable = true,
  sortBy,
  sortDirection = 'asc',
  onSort,

  // Selection
  selectable = false,
  selected = [],
  onSelect,
  onSelectAll,

  // Column visibility
  columnVisibility = true,
  defaultHiddenColumns = [],

  // Actions
  actions,
  rowActions,
  onRowClick,

  // Styling
  stickyHeader = true,
  dense = false,
  maxHeight,
  sx = {},
}) {
  const theme = useTheme();
  const { t } = useContext(AppContext) || { t: (key) => key };
  
  // Column visibility state
  const [hiddenColumns, setHiddenColumns] = useState(defaultHiddenColumns);
  
  const visibleColumns = useMemo(() => 
    columns.filter(col => !hiddenColumns.includes(col.id)).map(col => col.id),
    [columns, hiddenColumns]
  );

  const toggleColumn = useCallback((columnId) => {
    setHiddenColumns(prev => 
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  }, []);

  // Filtered columns
  const displayColumns = useMemo(() =>
    columns.filter(col => col.alwaysVisible || visibleColumns.includes(col.id)),
    [columns, visibleColumns]
  );

  // Handle pagination
  const handlePageChange = (event, newPage) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const handleRowsPerPageChange = (event) => {
    if (onRowsPerPageChange) {
      onRowsPerPageChange(parseInt(event.target.value, 10));
    }
  };

  // Handle sorting
  const handleSort = (columnId) => {
    if (onSort && sortable) {
      const isAsc = sortBy === columnId && sortDirection === 'asc';
      onSort(columnId, isAsc ? 'desc' : 'asc');
    }
  };

  // Handle selection
  const handleSelectAll = (event) => {
    if (onSelectAll) {
      onSelectAll(event.target.checked);
    }
  };

  const handleSelect = (id) => {
    if (onSelect) {
      onSelect(id);
    }
  };

  const isSelected = (id) => selected.includes(id);
  const numSelected = selected.length;
  const rowCount = data.length;

  // Loading state
  if (loading) {
    return (
      <Paper sx={{ overflow: 'hidden', ...sx }}>
        <TableSkeleton rows={rowsPerPage > 10 ? 10 : rowsPerPage} columns={displayColumns.length} />
      </Paper>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ overflow: 'hidden', ...sx }}>
        {columnVisibility && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, borderBottom: 1, borderColor: 'divider' }}>
            <ColumnVisibilityMenu
              columns={columns}
              visibleColumns={visibleColumns}
              onToggle={toggleColumn}
              t={t}
            />
          </Box>
        )}
        <EmptyState
          type="empty"
          title={emptyState?.title || (t ? t('Aucun résultat') : 'No results')}
          description={emptyState?.description || (t ? t('Aucune donnée à afficher') : 'No data to display')}
          action={emptyState?.action}
          actionLabel={emptyState?.actionLabel}
          onAction={emptyState?.onAction}
          size="medium"
        />
      </Paper>
    );
  }

  return (
    <Paper sx={{ overflow: 'hidden', ...sx }}>
      {/* Toolbar */}
      {(columnVisibility || actions || numSelected > 0) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 1,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: numSelected > 0 ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
          }}
        >
          {numSelected > 0 ? (
            <Typography variant="subtitle2" color="primary">
              {numSelected} {t ? t('sélectionné(s)') : 'selected'}
            </Typography>
          ) : (
            <Box />
          )}
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {actions}
            {columnVisibility && (
              <ColumnVisibilityMenu
                columns={columns}
                visibleColumns={visibleColumns}
                onToggle={toggleColumn}
                t={t}
              />
            )}
          </Box>
        </Box>
      )}

      {/* Table */}
      <TableContainer sx={{ maxHeight: maxHeight }}>
        <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={numSelected > 0 && numSelected < rowCount}
                    checked={rowCount > 0 && numSelected === rowCount}
                    onChange={handleSelectAll}
                    inputProps={{ 'aria-label': t ? t('select all') : 'select all' }}
                  />
                </TableCell>
              )}
              
              {displayColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth, width: column.width }}
                  sortDirection={sortBy === column.id ? sortDirection : false}
                >
                  {column.sortable !== false && sortable ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              
              {rowActions && (
                <TableCell align="right" style={{ width: 80 }}>
                  {t ? t('Actions') : 'Actions'}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {data.map((row, rowIndex) => {
              const isItemSelected = isSelected(row.id);
              const labelId = `table-checkbox-${rowIndex}`;

              return (
                <TableRow
                  key={row.id || rowIndex}
                  hover
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  role={selectable ? 'checkbox' : undefined}
                  aria-checked={selectable ? isItemSelected : undefined}
                  tabIndex={-1}
                  selected={isItemSelected}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(row.id);
                        }}
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </TableCell>
                  )}
                  
                  {displayColumns.map((column) => (
                    <TableCell key={column.id} align={column.align || 'left'}>
                      {column.render
                        ? column.render(row[column.id], row)
                        : row[column.id]}
                    </TableCell>
                  ))}
                  
                  {rowActions && (
                    <TableCell align="right">
                      {rowActions(row)}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && (
        <TablePagination
          component="div"
          count={serverPagination ? (totalCount || 0) : data.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={rowsPerPageOptions}
          labelRowsPerPage={t ? t('Lignes par page') : 'Rows per page'}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} ${t ? t('sur') : 'of'} ${count}`
          }
          sx={{ borderTop: 1, borderColor: 'divider' }}
        />
      )}
    </Paper>
  );
}
