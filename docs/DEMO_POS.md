# POS Mode Demo Guide

## Overview

The **POS (Point of Sale) Mode** transforms the bill creation page into a professional cashier-style interface, optimized for speed, barcode scanners, and touch devices.

---

## Quick Start

1. Navigate to **Factures** → **Nouvelle facture**
2. Toggle the **Mode POS** switch in the top-right corner
3. Start scanning barcodes or type product codes

---

## Key Features

### 🔍 Barcode-First Workflow
- **Auto-focus**: Cursor automatically focuses on the scan input field
- **Instant lookup**: Scanned barcodes are matched immediately
- **Enter to add**: Press Enter to add the first matching product
- **Dropdown results**: See multiple matches with stock info

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` | Focus search/scan input |
| `Enter` | Add product (when in search) |
| `+` or `↑` | Increase selected item quantity |
| `-` or `↓` | Decrease selected item quantity |
| `Delete` | Remove selected item |
| `Ctrl+Enter` | Finalize and save the bill |

### 🔊 Audio Feedback
- **Success beep** (800Hz): Product found
- **Error beep** (300Hz): Product not found or error
- **Add sound** (600Hz): Item added to cart
- **Remove sound** (400Hz): Item removed from cart
- **Finalize sound** (1000Hz): Bill saved successfully

### 📊 Cart Features
- **Sorting**: Click column headers to sort by product, quantity, price, or total
- **Quick filters**:
  - **All**: Show all items
  - **Duplicates**: Highlight products added multiple times
  - **Low Stock**: Highlight items with quantity > 80% of available stock
- **Real-time totals**: Subtotal, discount, tax, and total update instantly

### 📱 Touch-Friendly UI
- Large payment method buttons
- +/- quantity buttons on each row
- Collapsible customer info panel
- Large finalize button

---

## Demo Workflow

### Scenario: Cashier checkout

1. **Toggle POS Mode ON**
   - Click the "Mode POS" switch

2. **Scan products**
   - Use a barcode scanner OR
   - Type barcode/SKU in the input field
   - Press Enter to add

3. **Adjust quantities**
   - Click a row to select it
   - Press `+` to increase, `-` to decrease
   - Or use the +/- buttons on the row

4. **Apply discounts**
   - Edit the unit price or discount per item
   - Or apply a global discount in the right panel

5. **Select payment method**
   - Click one of the large payment buttons (Cash, Card, Check, Credit)

6. **Finalize**
   - Press `Ctrl+Enter` or click the "Finaliser" button
   - Hear the success sound and see the confirmation

---

## Technical Details

### Backend Endpoint
```
GET /products/barcode-lookup?q={query}
```
- **Exact match priority**: First checks for exact barcode/SKU match
- **Fallback search**: If no exact match, performs partial search
- **Response**: `{ found: bool, exact: bool, product?: {...}, products?: [...] }`

### Performance Optimizations
- **Debounced search**: 150ms delay to reduce API calls
- **Memoized components**: CartRow and POSCartTable use React.memo
- **Efficient re-renders**: Only affected rows update on changes

### Files Created
- `resources/js/hooks/usePOS.js` - POS hooks and audio utilities
- `resources/js/Components/pos/POSComponents.jsx` - UI components
- `resources/js/Components/pos/POSCartTable.jsx` - Memoized cart table
- `resources/js/Components/pos/index.js` - Barrel exports

---

## Configuration

### Default Mode
The POS mode preference is stored in `localStorage`:
```javascript
localStorage.getItem('pos_mode') // 'true' or 'false'
```

### Audio
Audio uses the Web Audio API with oscillator-based beeps:
```javascript
import { POSSounds } from '@/hooks/usePOS';

POSSounds.success();  // 800Hz beep
POSSounds.error();    // 300Hz beep
POSSounds.add();      // 600Hz beep
POSSounds.remove();   // 400Hz beep
POSSounds.finalize(); // 1000Hz beep
```

---

## Troubleshooting

### Barcode scanner not working?
1. Ensure the cursor is in the search field (press `/`)
2. Check that POS Mode is enabled
3. Verify the scanner is sending Enter after the barcode

### Keyboard shortcuts not responding?
1. Make sure you're not focused on an input field (except for `/`)
2. POS Mode must be enabled

### Audio not playing?
1. Some browsers block autoplay - interact with the page first
2. Check system volume settings

---

## Branch Info
- **Branch**: `wow/05-pos`
- **Parent**: Main branch with UI/UX redesign
