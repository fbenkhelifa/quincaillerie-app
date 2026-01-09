# PDF Invoice A4 Template Documentation

## Overview

This document describes the A4-optimized invoice PDF template for the Quincaillerie app.

## Paper Specifications

| Property | Value |
|----------|-------|
| **Paper Size** | A4 (ISO 216) |
| **Dimensions** | 210mm × 297mm |
| **Orientation** | Portrait |
| **Margins** | Top: 15mm, Right: 15mm, Bottom: 20mm, Left: 15mm |
| **Printable Width** | 180mm |
| **Printable Height** | 262mm |

## Template Architecture

### CSS Configuration

```css
@page {
    size: A4 portrait;
    margin: 15mm 15mm 20mm 15mm;
}
```

### Column Layout (Items Table)

The items table is precisely calculated for 180mm printable width:

| Column | Width (mm) | Width (%) | Alignment |
|--------|-----------|-----------|-----------|
| # | 8mm | 4.4% | Center |
| Désignation | 70mm | 38.9% | Left (RTL: Right) |
| Qté | 18mm | 10.0% | Center |
| P.U. | 28mm | 15.6% | Right (RTL: Left) |
| Remise | 22mm | 12.2% | Right (RTL: Left) |
| Total | 34mm | 18.9% | Right (RTL: Left) |
| **TOTAL** | **180mm** | **100%** | — |

## Features

### 1. Multi-Page Support
- Table headers repeat on every page (`display: table-header-group`)
- Rows don't break across pages (`page-break-inside: avoid`)
- Fixed footer on every page

### 2. RTL Support (Arabic)
- Full RTL layout with `dir="rtl"`
- Arabic translations for all labels
- RTL-aware text alignment

### 3. Status Badges
- **Payée** (Completed): Green badge
- **En attente** (Pending): Yellow badge
- **Annulée** (Cancelled): Red badge + watermark overlay

### 4. Typography
- Font: DejaVu Sans (UTF-8 compatible)
- Base font size: 9pt
- Line height: 1.35

## File Structure

```
resources/views/bills/
├── invoice-a4.blade.php    # A4-optimized template (PRIMARY)
├── invoice.blade.php       # Original template (legacy)
└── invoice.blade.php.bak   # Backup
```

## Controller Configuration

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

## Print Guidelines

1. **Printer Settings**: Use "Actual Size" or "100%" scaling
2. **Paper**: Standard A4 80gsm or higher
3. **Margins**: Printer should use 0mm margins (template has built-in margins)
4. **Color**: Full color recommended for badges and branding

## DomPDF Compatibility

This template is optimized for DomPDF with:
- Table-based layouts (no flexbox/grid)
- Millimeter units (mm) throughout
- Inline-block for badges
- Fixed positioning for footer
- No CSS transforms except watermark rotation

## Testing Checklist

- [ ] French single-page invoice
- [ ] Arabic (RTL) single-page invoice
- [ ] Multi-page invoice (10+ items)
- [ ] Cancelled invoice with watermark
- [ ] Invoice with notes
- [ ] Invoice with discounts
- [ ] Cash payment with change due
- [ ] Print on physical A4 paper

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2024 | Complete A4 redesign with strict paper compliance |
| 1.0.0 | 2024 | Initial professional template |
