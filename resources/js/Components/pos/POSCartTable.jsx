import { memo, useMemo, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    IconButton,
    TextField,
    InputAdornment,
    Tooltip,
    Chip,
    alpha,
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    Delete as DeleteIcon,
    Warning as WarningIcon,
    ContentCopy as DuplicateIcon,
} from '@mui/icons-material';

/**
 * Memoized Cart Row Component
 * Only re-renders when its specific item changes
 */
const CartRow = memo(function CartRow({
    item,
    index,
    isSelected,
    isDuplicate,
    onSelect,
    onIncrement,
    onDecrement,
    onRemove,
    onUpdatePrice,
    onUpdateDiscount,
    formatCurrency,
    t,
}) {
    const lineTotal = item.quantity * item.unit_price - (item.discount || 0);
    const isOverStock = item.quantity > item.available_stock;

    return (
        <TableRow
            hover
            selected={isSelected}
            onClick={() => onSelect(index)}
            sx={{
                cursor: 'pointer',
                bgcolor: isOverStock
                    ? (theme) => alpha(theme.palette.error.main, 0.05)
                    : isDuplicate
                    ? (theme) => alpha(theme.palette.warning.main, 0.05)
                    : undefined,
                '&.Mui-selected': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                },
            }}
        >
            {/* Product Info */}
            <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isDuplicate && (
                        <Tooltip title={t?.('Produit en double') || 'Produit en double'}>
                            <DuplicateIcon color="warning" sx={{ fontSize: 18 }} />
                        </Tooltip>
                    )}
                    <Box>
                        <Typography variant="body2" fontWeight={500}>
                            {item.product_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {item.product_sku || item.product_barcode}
                        </Typography>
                    </Box>
                </Box>
            </TableCell>

            {/* Stock Info */}
            <TableCell align="center">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    {isOverStock && (
                        <Tooltip title={t?.('Stock insuffisant') || 'Stock insuffisant'}>
                            <WarningIcon color="error" sx={{ fontSize: 16 }} />
                        </Tooltip>
                    )}
                    <Typography
                        variant="caption"
                        color={isOverStock ? 'error.main' : item.is_low_stock ? 'warning.main' : 'text.secondary'}
                    >
                        {item.available_stock} {item.unit}
                    </Typography>
                </Box>
            </TableCell>

            {/* Quantity Controls */}
            <TableCell align="center">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDecrement(index);
                        }}
                        sx={{
                            bgcolor: 'error.light',
                            color: 'error.contrastText',
                            '&:hover': { bgcolor: 'error.main' },
                            width: 32,
                            height: 32,
                        }}
                        aria-label="Decrease quantity"
                    >
                        <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography
                        sx={{
                            minWidth: 40,
                            textAlign: 'center',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                        }}
                    >
                        {item.quantity}
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onIncrement(index);
                        }}
                        sx={{
                            bgcolor: 'success.light',
                            color: 'success.contrastText',
                            '&:hover': { bgcolor: 'success.main' },
                            width: 32,
                            height: 32,
                        }}
                        aria-label="Increase quantity"
                    >
                        <AddIcon fontSize="small" />
                    </IconButton>
                </Box>
            </TableCell>

            {/* Unit Price */}
            <TableCell align="right">
                <TextField
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => onUpdatePrice(index, parseFloat(e.target.value) || 0)}
                    onClick={(e) => e.stopPropagation()}
                    size="small"
                    sx={{ width: 100 }}
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">DA</InputAdornment>,
                    }}
                />
            </TableCell>

            {/* Discount */}
            <TableCell align="right">
                <TextField
                    type="number"
                    value={item.discount || 0}
                    onChange={(e) => onUpdateDiscount(index, parseFloat(e.target.value) || 0)}
                    onClick={(e) => e.stopPropagation()}
                    size="small"
                    sx={{ width: 80 }}
                    inputProps={{ min: 0, step: 1 }}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">DA</InputAdornment>,
                    }}
                />
            </TableCell>

            {/* Line Total */}
            <TableCell align="right">
                <Typography fontWeight={600} color={isOverStock ? 'error.main' : 'primary.main'}>
                    {formatCurrency(lineTotal)}
                </Typography>
            </TableCell>

            {/* Actions */}
            <TableCell align="center" padding="none">
                <Tooltip title={t?.('Supprimer') || 'Supprimer'}>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(index);
                        }}
                        color="error"
                        aria-label="Remove item"
                    >
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </TableCell>
        </TableRow>
    );
});

/**
 * POS Cart Table with sorting and filtering
 */
export const POSCartTable = memo(function POSCartTable({
    items,
    selectedIndex,
    duplicateProducts,
    filter,
    onSelect,
    onIncrement,
    onDecrement,
    onRemove,
    onUpdatePrice,
    onUpdateDiscount,
    formatCurrency,
    t,
}) {
    const [sortBy, setSortBy] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    // Handle sort
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    // Filter and sort items
    const displayedItems = useMemo(() => {
        let filtered = [...items];

        // Apply filter
        if (filter === 'duplicates') {
            filtered = filtered.filter((item) =>
                duplicateProducts.includes(String(item.product_id))
            );
        } else if (filter === 'lowstock') {
            filtered = filtered.filter(
                (item) => item.is_low_stock || item.quantity > item.available_stock
            );
        }

        // Apply sort
        if (sortBy) {
            filtered.sort((a, b) => {
                let aVal = a[sortBy];
                let bVal = b[sortBy];

                if (sortBy === 'total') {
                    aVal = a.quantity * a.unit_price - (a.discount || 0);
                    bVal = b.quantity * b.unit_price - (b.discount || 0);
                }

                if (typeof aVal === 'string') {
                    return sortDirection === 'asc'
                        ? aVal.localeCompare(bVal)
                        : bVal.localeCompare(aVal);
                }
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            });
        }

        return filtered;
    }, [items, filter, duplicateProducts, sortBy, sortDirection]);

    // Find original index for filtered items
    const getOriginalIndex = (filteredItem) => {
        return items.findIndex((item) => item.product_id === filteredItem.product_id);
    };

    if (items.length === 0) {
        return (
            <Paper
                sx={{
                    p: 6,
                    textAlign: 'center',
                    bgcolor: 'grey.50',
                    border: '2px dashed',
                    borderColor: 'grey.300',
                }}
            >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t?.('Panier vide') || 'Panier vide'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {t?.('Scannez un code-barres ou recherchez un produit') ||
                        'Scannez un code-barres ou recherchez un produit'}
                </Typography>
            </Paper>
        );
    }

    return (
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <TableSortLabel
                                active={sortBy === 'product_name'}
                                direction={sortBy === 'product_name' ? sortDirection : 'asc'}
                                onClick={() => handleSort('product_name')}
                            >
                                {t?.('Produit') || 'Produit'}
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="center">{t?.('Stock') || 'Stock'}</TableCell>
                        <TableCell align="center">
                            <TableSortLabel
                                active={sortBy === 'quantity'}
                                direction={sortBy === 'quantity' ? sortDirection : 'asc'}
                                onClick={() => handleSort('quantity')}
                            >
                                {t?.('Qté') || 'Qté'}
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">
                            <TableSortLabel
                                active={sortBy === 'unit_price'}
                                direction={sortBy === 'unit_price' ? sortDirection : 'asc'}
                                onClick={() => handleSort('unit_price')}
                            >
                                {t?.('Prix') || 'Prix'}
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">{t?.('Remise') || 'Remise'}</TableCell>
                        <TableCell align="right">
                            <TableSortLabel
                                active={sortBy === 'total'}
                                direction={sortBy === 'total' ? sortDirection : 'asc'}
                                onClick={() => handleSort('total')}
                            >
                                {t?.('Total') || 'Total'}
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="center" padding="none" sx={{ width: 50 }}></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {displayedItems.map((item) => {
                        const originalIndex = getOriginalIndex(item);
                        return (
                            <CartRow
                                key={`${item.product_id}-${originalIndex}`}
                                item={item}
                                index={originalIndex}
                                isSelected={selectedIndex === originalIndex}
                                isDuplicate={duplicateProducts.includes(String(item.product_id))}
                                onSelect={onSelect}
                                onIncrement={onIncrement}
                                onDecrement={onDecrement}
                                onRemove={onRemove}
                                onUpdatePrice={onUpdatePrice}
                                onUpdateDiscount={onUpdateDiscount}
                                formatCurrency={formatCurrency}
                                t={t}
                            />
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
});

export default POSCartTable;
