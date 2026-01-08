import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import debounce from 'lodash.debounce';

/**
 * Sound feedback for POS operations
 */
const createBeep = (frequency, duration, volume = 0.3) => {
    return () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            gainNode.gain.value = volume;
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + duration / 1000);
        } catch (e) {
            // Audio not supported, fail silently
        }
    };
};

export const POSSounds = {
    success: createBeep(800, 100, 0.2),      // Short high beep for scan success
    error: createBeep(300, 200, 0.3),        // Low beep for errors
    add: createBeep(600, 50, 0.15),          // Quick beep for item add
    remove: createBeep(400, 100, 0.2),       // Medium beep for remove
    finalize: createBeep(1000, 150, 0.25),   // High beep for finalize
};

/**
 * Hook for barcode scanning with keyboard support
 */
export function useBarcodeScanner({ onScan, onError, enabled = true }) {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const inputRef = useRef(null);
    const lastScanTime = useRef(0);

    // Debounced search for partial matches
    const searchProducts = useMemo(
        () =>
            debounce(async (query) => {
                if (!query || query.length < 2) {
                    setSearchResults([]);
                    setShowDropdown(false);
                    return;
                }

                setIsLoading(true);
                try {
                    const response = await fetch(
                        route('products.barcode-lookup') + `?barcode=${encodeURIComponent(query)}`
                    );
                    const data = await response.json();

                    if (data.exact && data.product) {
                        // Exact match - add immediately
                        onScan(data.product);
                        POSSounds.success();
                        setInputValue('');
                        setSearchResults([]);
                        setShowDropdown(false);
                    } else if (data.products?.length > 0) {
                        // Show dropdown with partial matches
                        setSearchResults(data.products);
                        setShowDropdown(true);
                    } else {
                        setSearchResults([]);
                        setShowDropdown(false);
                    }
                } catch (error) {
                    console.error('Barcode lookup error:', error);
                    POSSounds.error();
                    onError?.('Erreur de recherche');
                } finally {
                    setIsLoading(false);
                }
            }, 150),
        [onScan, onError]
    );

    // Focus input on mount and when enabled
    useEffect(() => {
        if (enabled && inputRef.current) {
            inputRef.current.focus();
        }
    }, [enabled]);

    // Handle input change
    const handleInputChange = useCallback(
        (e) => {
            const value = e.target.value;
            setInputValue(value);
            searchProducts(value);
        },
        [searchProducts]
    );

    // Handle Enter key - attempt exact lookup or select first result
    const handleKeyDown = useCallback(
        async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                
                if (searchResults.length > 0) {
                    // Select first result
                    onScan(searchResults[0]);
                    POSSounds.add();
                    setInputValue('');
                    setSearchResults([]);
                    setShowDropdown(false);
                } else if (inputValue.trim()) {
                    // Try exact barcode lookup
                    setIsLoading(true);
                    try {
                        const response = await fetch(
                            route('products.barcode-lookup') + `?barcode=${encodeURIComponent(inputValue.trim())}`
                        );
                        const data = await response.json();

                        if (data.exact && data.product) {
                            onScan(data.product);
                            POSSounds.success();
                            setInputValue('');
                        } else if (data.products?.length === 1) {
                            onScan(data.products[0]);
                            POSSounds.add();
                            setInputValue('');
                        } else if (data.products?.length > 1) {
                            setSearchResults(data.products);
                            setShowDropdown(true);
                        } else {
                            POSSounds.error();
                            onError?.('Produit non trouvé');
                        }
                    } catch (error) {
                        POSSounds.error();
                        onError?.('Erreur de recherche');
                    } finally {
                        setIsLoading(false);
                    }
                }
            } else if (e.key === 'Escape') {
                setInputValue('');
                setSearchResults([]);
                setShowDropdown(false);
            } else if (e.key === 'ArrowDown' && showDropdown && searchResults.length > 0) {
                e.preventDefault();
                // Focus first dropdown item
            }
        },
        [inputValue, searchResults, showDropdown, onScan, onError]
    );

    // Select a product from dropdown
    const selectProduct = useCallback(
        (product) => {
            onScan(product);
            POSSounds.add();
            setInputValue('');
            setSearchResults([]);
            setShowDropdown(false);
            inputRef.current?.focus();
        },
        [onScan]
    );

    // Focus the input
    const focusInput = useCallback(() => {
        inputRef.current?.focus();
    }, []);

    // Clear input
    const clearInput = useCallback(() => {
        setInputValue('');
        setSearchResults([]);
        setShowDropdown(false);
        inputRef.current?.focus();
    }, []);

    return {
        inputValue,
        inputRef,
        isLoading,
        searchResults,
        showDropdown,
        handleInputChange,
        handleKeyDown,
        selectProduct,
        focusInput,
        clearInput,
        setShowDropdown,
    };
}

/**
 * Hook for POS keyboard shortcuts
 */
export function usePOSKeyboardShortcuts({
    onFocusSearch,
    onFinalize,
    onIncrement,
    onDecrement,
    onDelete,
    enabled = true,
    selectedIndex = -1,
}) {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e) => {
            // Ignore if typing in an input (except for specific shortcuts)
            const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
                document.activeElement?.tagName
            );

            // Ctrl+Enter - Finalize bill
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                onFinalize?.();
                return;
            }

            // / - Focus search (only if not in input)
            if (e.key === '/' && !isInputFocused) {
                e.preventDefault();
                onFocusSearch?.();
                return;
            }

            // If a row is selected (selectedIndex >= 0)
            if (selectedIndex >= 0 && !isInputFocused) {
                if (e.key === '+' || e.key === '=') {
                    e.preventDefault();
                    onIncrement?.(selectedIndex);
                } else if (e.key === '-') {
                    e.preventDefault();
                    onDecrement?.(selectedIndex);
                } else if (e.key === 'Delete' || e.key === 'Backspace') {
                    e.preventDefault();
                    onDelete?.(selectedIndex);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enabled, selectedIndex, onFocusSearch, onFinalize, onIncrement, onDecrement, onDelete]);
}

/**
 * Hook for managing POS cart with memoization
 */
export function usePOSCart(initialItems = []) {
    const [items, setItems] = useState(initialItems);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    // Add or increment product
    const addProduct = useCallback((product) => {
        setItems((prev) => {
            const existingIndex = prev.findIndex((item) => item.product_id === product.id);

            if (existingIndex >= 0) {
                // Increment quantity
                const newItems = [...prev];
                newItems[existingIndex] = {
                    ...newItems[existingIndex],
                    quantity: newItems[existingIndex].quantity + 1,
                };
                return newItems;
            } else {
                // Add new item
                return [
                    ...prev,
                    {
                        product_id: product.id,
                        product_name: product.name,
                        product_name_ar: product.name_ar,
                        product_sku: product.sku,
                        product_barcode: product.barcode,
                        quantity: 1,
                        unit: product.unit,
                        unit_price: parseFloat(product.selling_price),
                        discount: 0,
                        available_stock: parseFloat(product.quantity),
                        is_low_stock: parseFloat(product.quantity) <= parseFloat(product.min_stock || 0),
                    },
                ];
            }
        });
    }, []);

    // Update item field
    const updateItem = useCallback((index, field, value) => {
        setItems((prev) => {
            const newItems = [...prev];
            newItems[index] = { ...newItems[index], [field]: value };
            return newItems;
        });
    }, []);

    // Increment quantity
    const incrementQuantity = useCallback((index) => {
        setItems((prev) => {
            const newItems = [...prev];
            newItems[index] = {
                ...newItems[index],
                quantity: newItems[index].quantity + 1,
            };
            return newItems;
        });
        POSSounds.add();
    }, []);

    // Decrement quantity
    const decrementQuantity = useCallback((index) => {
        setItems((prev) => {
            const item = prev[index];
            if (item.quantity <= 1) {
                POSSounds.remove();
                return prev.filter((_, i) => i !== index);
            }
            const newItems = [...prev];
            newItems[index] = {
                ...newItems[index],
                quantity: newItems[index].quantity - 1,
            };
            POSSounds.add();
            return newItems;
        });
    }, []);

    // Remove item
    const removeItem = useCallback((index) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
        POSSounds.remove();
        setSelectedIndex(-1);
    }, []);

    // Clear cart
    const clearCart = useCallback(() => {
        setItems([]);
        setSelectedIndex(-1);
    }, []);

    // Calculate subtotal
    const subtotal = useMemo(() => {
        return items.reduce((total, item) => {
            return total + item.quantity * item.unit_price - (item.discount || 0);
        }, 0);
    }, [items]);

    // Items with duplicates (same product added multiple times)
    const duplicateProducts = useMemo(() => {
        const productCounts = {};
        items.forEach((item) => {
            productCounts[item.product_id] = (productCounts[item.product_id] || 0) + 1;
        });
        return Object.keys(productCounts).filter((id) => productCounts[id] > 1);
    }, [items]);

    // Items with low stock warning
    const lowStockItems = useMemo(() => {
        return items.filter((item) => item.is_low_stock || item.quantity > item.available_stock);
    }, [items]);

    return {
        items,
        setItems,
        selectedIndex,
        setSelectedIndex,
        addProduct,
        updateItem,
        incrementQuantity,
        decrementQuantity,
        removeItem,
        clearCart,
        subtotal,
        duplicateProducts,
        lowStockItems,
    };
}

export default {
    useBarcodeScanner,
    usePOSKeyboardShortcuts,
    usePOSCart,
    POSSounds,
};
