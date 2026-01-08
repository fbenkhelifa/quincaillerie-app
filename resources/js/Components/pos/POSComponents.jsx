import { memo, useRef, useEffect, useState, useCallback } from 'react';
import {
    Box,
    TextField,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    InputAdornment,
    CircularProgress,
    Chip,
    Popper,
    ClickAwayListener,
    Fade,
    alpha,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    QrCodeScanner as ScannerIcon,
    Search as SearchIcon,
    Inventory as InventoryIcon,
    Warning as WarningIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';

/**
 * Barcode Scanner Input Component
 * Auto-focused input for barcode scanning with dropdown search results
 */
export const BarcodeInput = memo(function BarcodeInput({
    value,
    inputRef,
    isLoading,
    searchResults,
    showDropdown,
    onInputChange,
    onKeyDown,
    onSelectProduct,
    onClear,
    onCloseDropdown,
    placeholder,
    disabled,
    formatCurrency,
    t,
}) {
    const containerRef = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        setAnchorEl(containerRef.current);
    }, []);

    return (
        <ClickAwayListener onClickAway={() => onCloseDropdown?.()}>
            <Box ref={containerRef} sx={{ position: 'relative', width: '100%' }}>
                <TextField
                    inputRef={inputRef}
                    value={value}
                    onChange={onInputChange}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder || t?.('Scanner ou taper un code-barres...') || 'Scanner ou taper un code-barres...'}
                    disabled={disabled}
                    fullWidth
                    autoComplete="off"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            fontSize: '1.25rem',
                            bgcolor: 'background.paper',
                            '& fieldset': {
                                borderWidth: 2,
                                borderColor: 'primary.main',
                            },
                            '&:hover fieldset': {
                                borderColor: 'primary.dark',
                            },
                            '&.Mui-focused fieldset': {
                                borderWidth: 3,
                            },
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <ScannerIcon color="primary" sx={{ fontSize: 28 }} />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                {isLoading ? (
                                    <CircularProgress size={24} />
                                ) : value ? (
                                    <IconButton size="small" onClick={onClear} aria-label="Clear">
                                        <ClearIcon />
                                    </IconButton>
                                ) : (
                                    <Chip
                                        label="Enter"
                                        size="small"
                                        sx={{ 
                                            bgcolor: 'grey.200',
                                            fontFamily: 'monospace',
                                            fontSize: '0.75rem',
                                        }}
                                    />
                                )}
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Dropdown Results */}
                <Popper
                    open={showDropdown && searchResults.length > 0}
                    anchorEl={anchorEl}
                    placement="bottom-start"
                    transition
                    style={{ width: anchorEl?.offsetWidth, zIndex: 1300 }}
                >
                    {({ TransitionProps }) => (
                        <Fade {...TransitionProps} timeout={200}>
                            <Paper
                                elevation={8}
                                sx={{
                                    mt: 0.5,
                                    maxHeight: 300,
                                    overflow: 'auto',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <List dense>
                                    {searchResults.map((product, index) => (
                                        <ListItem
                                            key={product.id}
                                            onClick={() => onSelectProduct(product)}
                                            sx={{
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                },
                                                borderBottom: index < searchResults.length - 1 ? '1px solid' : 'none',
                                                borderColor: 'divider',
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    variant="rounded"
                                                    sx={{
                                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                                    }}
                                                >
                                                    <InventoryIcon color="primary" />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body1" fontWeight={500}>
                                                            {product.name}
                                                        </Typography>
                                                        {product.quantity <= (product.min_stock || 0) && (
                                                            <Tooltip title={t?.('Stock bas') || 'Stock bas'}>
                                                                <WarningIcon color="warning" sx={{ fontSize: 16 }} />
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {product.barcode || product.sku}
                                                        </Typography>
                                                        <Typography variant="caption" fontWeight={600} color="primary.main">
                                                            {formatCurrency?.(product.selling_price) || `${product.selling_price} DA`}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Stock: {product.quantity} {product.unit}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Fade>
                    )}
                </Popper>
            </Box>
        </ClickAwayListener>
    );
});

/**
 * Keyboard Shortcuts Help Panel
 */
export const KeyboardShortcutsPanel = memo(function KeyboardShortcutsPanel({ t }) {
    const shortcuts = [
        { key: '/', desc: t?.('Rechercher') || 'Rechercher' },
        { key: 'Enter', desc: t?.('Ajouter produit') || 'Ajouter produit' },
        { key: '+/-', desc: t?.('Ajuster quantité') || 'Ajuster quantité' },
        { key: 'Del', desc: t?.('Supprimer ligne') || 'Supprimer ligne' },
        { key: 'Ctrl+Enter', desc: t?.('Finaliser') || 'Finaliser' },
    ];

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 1.5,
                bgcolor: 'grey.50',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                justifyContent: 'center',
            }}
        >
            {shortcuts.map((s) => (
                <Box key={s.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip
                        label={s.key}
                        size="small"
                        sx={{
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'grey.300',
                        }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        {s.desc}
                    </Typography>
                </Box>
            ))}
        </Paper>
    );
});

/**
 * Visual Feedback Overlay for scan events
 */
export const ScanFeedback = memo(function ScanFeedback({ type, message, show }) {
    const bgColor = type === 'success' ? 'success.main' : type === 'error' ? 'error.main' : 'info.main';

    if (!show) return null;

    return (
        <Fade in={show}>
            <Box
                sx={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: bgColor,
                    color: 'white',
                    px: 4,
                    py: 2,
                    borderRadius: 2,
                    boxShadow: 8,
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                {type === 'success' && <ScannerIcon sx={{ fontSize: 32 }} />}
                {type === 'error' && <WarningIcon sx={{ fontSize: 32 }} />}
                <Typography variant="h6" fontWeight={600}>
                    {message}
                </Typography>
            </Box>
        </Fade>
    );
});

/**
 * Quick Filter Chips for cart
 */
export const CartFilters = memo(function CartFilters({
    activeFilter,
    onFilterChange,
    duplicateCount,
    lowStockCount,
    t,
}) {
    return (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
                label={t?.('Tout') || 'Tout'}
                variant={activeFilter === 'all' ? 'filled' : 'outlined'}
                color={activeFilter === 'all' ? 'primary' : 'default'}
                onClick={() => onFilterChange('all')}
                size="small"
            />
            {duplicateCount > 0 && (
                <Chip
                    label={`${t?.('Doublons') || 'Doublons'} (${duplicateCount})`}
                    variant={activeFilter === 'duplicates' ? 'filled' : 'outlined'}
                    color={activeFilter === 'duplicates' ? 'warning' : 'default'}
                    onClick={() => onFilterChange('duplicates')}
                    size="small"
                />
            )}
            {lowStockCount > 0 && (
                <Chip
                    label={`${t?.('Stock bas') || 'Stock bas'} (${lowStockCount})`}
                    variant={activeFilter === 'lowstock' ? 'filled' : 'outlined'}
                    color={activeFilter === 'lowstock' ? 'error' : 'default'}
                    onClick={() => onFilterChange('lowstock')}
                    size="small"
                    icon={<WarningIcon sx={{ fontSize: 16 }} />}
                />
            )}
        </Box>
    );
});

export default {
    BarcodeInput,
    KeyboardShortcutsPanel,
    ScanFeedback,
    CartFilters,
};
