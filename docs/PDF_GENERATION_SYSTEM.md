# A4 PDF Generation System Documentation

## Overview

This document describes the enterprise-grade A4-compliant PDF generation system for Bills (Factures) and Purchase Orders (Bons de Commande) in the Quincaillerie app.

## Technology Stack

### Chosen Solution: DomPDF with A4-Optimized Templates

**Why DomPDF?**
- ✅ No external dependencies (pure PHP)
- ✅ Lightweight and fast
- ✅ Works on any hosting environment
- ✅ Sufficient CSS support for our needs

**Alternatives Considered:**
- **Snappy/wkhtmltopdf**: Better CSS but requires binary installation
- **Browsershot/Puppeteer**: Best CSS (Chrome) but requires Node.js + Chrome binary

## A4 Paper Specifications

| Property | Value |
|----------|-------|
| **Paper Size** | A4 (ISO 216) |
| **Dimensions** | 210mm × 297mm |
| **Orientation** | Portrait |
| **Margins** | 15mm (all sides), 20mm (bottom for footer) |
| **Printable Width** | 180mm |
| **Printable Height** | 262mm |

## File Structure

```
resources/views/
├── bills/
│   ├── invoice-a4.blade.php          # A4 Bills template ✓
│   ├── invoice.blade.php             # Legacy template
│   └── invoice.blade.php.bak         # Backup
└── pdf/
    ├── purchase-order-a4.blade.php   # A4 Purchase Orders template ✓
    └── purchase-order.blade.php      # Legacy template

app/Http/Controllers/
├── BillsController.php               # Uses invoice-a4
└── PurchasesController.php           # Uses purchase-order-a4
```

## Bills (Factures) Template

### Controller Configuration
**File**: `app/Http/Controllers/BillsController.php`

```php
public function downloadPdf(Bill $bill, string $lang = 'fr')
{
    $bill->load(['items.product', 'worker', 'user']);
    $settings = Setting::instance();
    $isRtl = $lang === 'ar';
    
    $pdf = Pdf::loadView('bills.invoice-a4', [
        'bill' => $bill,
        'settings' => $settings,
        'lang' => $lang,
        'isRtl' => $isRtl,
    ]);

    $pdf->setPaper('A4', 'portrait');
    $pdf->setOption('isRemoteEnabled', true);
    $pdf->setOption('isHtml5ParserEnabled', true);
    $pdf->setOption('isFontSubsettingEnabled', true);
    
    return $pdf->download("facture-{$bill->bill_number}.pdf");
}
```

### Template Structure
**File**: `resources/views/bills/invoice-a4.blade.php`

**Column Layout (Items Table):**
| Column | Width (mm) | Width (%) | Content |
|--------|-----------|-----------|---------|
| # | 8mm | 4.4% | Row number |
| Désignation | 70mm | 38.9% | Product name + SKU |
| Qté | 18mm | 10.0% | Quantity + unit |
| P.U. | 28mm | 15.6% | Unit price |
| Remise | 22mm | 12.2% | Discount |
| Total | 34mm | 18.9% | Line total |
| **TOTAL** | **180mm** | **100%** | — |

## Purchase Orders (Bons de Commande) Template

### Controller Configuration
**File**: `app/Http/Controllers/PurchasesController.php`

```php
public function downloadPdf(PurchaseOrder $purchase, string $lang = 'fr')
{
    app()->setLocale($lang);
    $purchase->load(['supplier', 'items.product', 'user']);
    $settings = \App\Models\Setting::instance()->toArray();

    $pdf = Pdf::loadView('pdf.purchase-order-a4', [
        'order' => $purchase,
        'settings' => $settings,
        'lang' => $lang,
    ]);

    $pdf->setPaper('A4', 'portrait');
    $pdf->setOption('isRemoteEnabled', true);
    $pdf->setOption('isHtml5ParserEnabled', true);
    $pdf->setOption('isFontSubsettingEnabled', true);

    return $pdf->download("PO-{$purchase->po_number}.pdf");
}
```

### Template Structure
**File**: `resources/views/pdf/purchase-order-a4.blade.php`

**Column Layout (Items Table):**
| Column | Width (mm) | Width (%) | Content |
|--------|-----------|-----------|---------|
| # | 8mm | 4.4% | Row number |
| Désignation | 72mm | 40% | Product name + SKU |
| Quantité | 26mm | 14.4% | Quantity + unit |
| Prix unitaire | 36mm | 20% | Unit cost |
| Total | 38mm | 21.1% | Line total |
| **TOTAL** | **180mm** | **100%** | — |

## CSS Architecture

### Critical @page Rule
```css
@page {
    size: A4 portrait;
    margin: 15mm 15mm 20mm 15mm;
}
```

### Key CSS Patterns

**1. Fixed Width Container**
```css
.container {
    width: 100%;
    max-width: 180mm;
    margin: 0;
    padding: 0;
}
```

**2. Table Layouts (No Flexbox/Grid)**
```css
.header-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
}
```

**3. Precise Column Widths**
```css
.items-table .col-num { width: 4.4%; }
.items-table .col-desc { width: 38.9%; }
/* Exact percentages that sum to 100% */
```

**4. Page Break Control**
```css
.header { page-break-inside: avoid; }
.items-table thead { display: table-header-group; }
.items-table tr { page-break-inside: avoid; }
```

**5. Millimeter Units**
```css
padding: 2.5mm;
margin-bottom: 4mm;
font-size: 9pt; /* 1pt = 0.3528mm */
```

## Font Configuration

**Font**: DejaVu Sans (UTF-8 compatible, supports Arabic/French)

```css
@font-face {
    font-family: 'DejaVu Sans';
    src: url('{{ storage_path("fonts/DejaVuSans.ttf") }}') format('truetype');
    font-weight: normal;
}

@font-face {
    font-family: 'DejaVu Sans';
    src: url('{{ storage_path("fonts/DejaVuSans-Bold.ttf") }}') format('truetype');
    font-weight: bold;
}
```

## Features

### Bills (Factures)
- ✅ Status badges (Payée/En attente/Annulée)
- ✅ "ANNULÉE" watermark for cancelled invoices
- ✅ RTL support for Arabic
- ✅ Payment received/change for cash transactions
- ✅ Multi-page support with repeating headers
- ✅ Notes section
- ✅ Fixed footer

### Purchase Orders (Bons de Commande)
- ✅ Status badges (Draft/Sent/Partial/Received/Cancelled)
- ✅ Date tracking (Order/Expected/Received)
- ✅ Supplier details
- ✅ Delivery address
- ✅ Tax and shipping costs
- ✅ Multi-page support with repeating headers
- ✅ Supplier notes section
- ✅ Fixed footer

## Print Guidelines

### Printer Settings
- **Scaling**: Use "Actual Size" or "100%" (not "Fit to Page")
- **Paper**: Standard A4 80gsm or higher
- **Margins**: Printer should use 0mm margins (template has built-in margins)
- **Color**: Full color recommended for badges and branding

### Testing Checklist

**Bills:**
- [ ] French single-page invoice
- [ ] Arabic (RTL) single-page invoice
- [ ] Multi-page invoice (10+ items)
- [ ] Cancelled invoice with watermark
- [ ] Invoice with notes
- [ ] Invoice with discounts
- [ ] Cash payment with change due
- [ ] Print on physical A4 paper

**Purchase Orders:**
- [ ] Draft purchase order
- [ ] Sent purchase order
- [ ] Received purchase order
- [ ] Multi-page order (10+ items)
- [ ] Order with tax and shipping
- [ ] Order with supplier notes
- [ ] Print on physical A4 paper

## DomPDF Compatibility Notes

**Supported:**
- ✅ Table layouts
- ✅ Millimeter/point units
- ✅ `@page` rule
- ✅ Fixed positioning (footer)
- ✅ `page-break-inside: avoid`
- ✅ `display: table-header-group` (repeating headers)
- ✅ `@font-face` with TTF fonts
- ✅ Basic CSS3 (borders, backgrounds, shadows)

**Not Supported:**
- ❌ Flexbox layouts
- ❌ CSS Grid
- ❌ `transform` (except simple rotations)
- ❌ Complex pseudo-elements
- ❌ CSS animations
- ❌ `calc()` function
- ❌ CSS variables

## Troubleshooting

### Issue: Content Overflow

**Cause**: Column widths exceed 180mm
**Solution**: Recalculate column percentages to sum exactly 100%

```php
// Example: 5 columns on 180mm
$col1 = 8mm  / 180mm * 100 = 4.4%
$col2 = 70mm / 180mm * 100 = 38.9%
$col3 = 18mm / 180mm * 100 = 10.0%
$col4 = 28mm / 180mm * 100 = 15.6%
$col5 = 56mm / 180mm * 100 = 31.1%
Total = 100%
```

### Issue: Text Cut Off

**Cause**: Font size too large for cell width
**Solution**: Reduce font size or increase column width

```css
.items-table td {
    font-size: 8pt; /* Reduced from 9pt */
    word-wrap: break-word; /* Allow text wrapping */
}
```

### Issue: Blank Second Page

**Cause**: Fixed footer positioning
**Solution**: Ensure content height < 262mm (297mm - 15mm - 20mm)

### Issue: Headers Not Repeating

**Cause**: Missing `display: table-header-group`
**Solution**: Add to `<thead>`

```css
.items-table thead {
    display: table-header-group;
}
```

## Performance Optimization

1. **Font Subsetting**: Enable via `isFontSubsettingEnabled` option
2. **Minimize Images**: Use CSS gradients/colors instead
3. **Simplify DOM**: Fewer nested elements = faster rendering
4. **Cache Settings**: Load `Setting::instance()` once per request

## Version History

| Version | Date | Document | Changes |
|---------|------|----------|---------|
| 2.0 | Jan 2026 | Bills & Purchase Orders | Complete A4 redesign with strict compliance |
| 1.0 | Jan 2026 | Bills only | Initial professional template |

## Migration from Legacy Templates

**Old Templates** (not A4-compliant):
- `resources/views/bills/invoice.blade.php`
- `resources/views/pdf/purchase-order.blade.php`

**New Templates** (A4-compliant):
- `resources/views/bills/invoice-a4.blade.php` ✓
- `resources/views/pdf/purchase-order-a4.blade.php` ✓

**Controllers Updated:**
- ✅ `BillsController@downloadPdf` → uses `invoice-a4`
- ✅ `PurchasesController@downloadPdf` → uses `purchase-order-a4`

**No Database Changes Required** - purely view layer changes.

## Support & Maintenance

For issues or improvements:
1. Check DomPDF documentation: https://github.com/dompdf/dompdf
2. Validate HTML structure with: https://validator.w3.org/
3. Test print preview in browser before PDF generation
4. Use browser DevTools to debug CSS

## License

MIT - Same as Laravel framework
