# PDF Invoice System Documentation

## Overview

This document describes the professional PDF invoice generation system for the Quincaillerie application. The system generates enterprise-grade invoices that are print-ready, bilingual (French/Arabic), and conform to standard accounting document practices.

## Architecture

### Components

| Component | Location | Description |
|-----------|----------|-------------|
| Controller | `app/Http/Controllers/BillsController.php` | `downloadPdf()` method |
| Template | `resources/views/bills/invoice.blade.php` | Blade template with embedded CSS |
| PDF Engine | `barryvdh/laravel-dompdf` | DomPDF wrapper for Laravel |
| Route | `bills/{bill}/pdf/{lang?}` | Named route: `bills.pdf` |

### PDF Generation Flow

```
Request → BillsController@downloadPdf
       → Load Bill with relations (items, worker, user)
       → Load Settings (store info)
       → Render Blade template
       → DomPDF converts HTML to PDF
       → Download response
```

---

## Invoice Structure

The invoice follows a clear hierarchical structure optimized for readability and professional appearance:

### A. Header Section
```
┌─────────────────────────────────────────────────────────────────┐
│  COMPANY NAME                              FACTURE              │
│  Owner Name                                ┌──────────────────┐ │
│  Address                                   │ FAC-20260109-001 │ │
│  Phone / Email                             └──────────────────┘ │
│  NIF / RC                                  Date: 09/01/2026    │
│                                            Heure: 14:30        │
│                                            [STATUS BADGE]       │
└─────────────────────────────────────────────────────────────────┘
```

### B. Client & Transaction Info
```
┌──────────────────────────────┐ ┌──────────────────────────────┐
│ CLIENT                       │ │ TRANSACTION                  │
│ Customer Name                │ │ Vendeur: John Doe            │
│ Tél: +213 XX XX XX XX        │ │ Paiement: Espèces            │
└──────────────────────────────┘ └──────────────────────────────┘
```

### C. Items Table
```
┌────┬─────────────────────┬────────┬──────────┬────────┬──────────┐
│ #  │ Désignation         │ Qté    │ P.U.     │ Remise │ Total    │
├────┼─────────────────────┼────────┼──────────┼────────┼──────────┤
│ 1  │ Product Name        │ 5 pcs  │ 1 250,00 │ —      │ 6 250,00 │
│    │ Réf: PRD-00123      │        │          │        │          │
├────┼─────────────────────┼────────┼──────────┼────────┼──────────┤
│ 2  │ Another Product     │ 2 kg   │ 850,00   │ -50,00 │ 1 650,00 │
│    │ Réf: PRD-00456      │        │          │        │          │
└────┴─────────────────────┴────────┴──────────┴────────┴──────────┘
```

### D. Totals Section (Right-aligned)
```
                                    ┌─────────────────────────────┐
                                    │ Sous-total      │ 7 900,00  │
                                    │ Remise          │   -50,00  │
                                    │ TVA             │   790,00  │
                                    ├─────────────────┼───────────┤
                                    │ TOTAL TTC       │ 8 640,00  │
                                    └─────────────────┴───────────┘
```

### E. Notes Section (Optional)
```
┌─────────────────────────────────────────────────────────────────┐
│ REMARQUES                                                        │
│ Customer special instructions or invoice notes...                │
└─────────────────────────────────────────────────────────────────┘
```

### F. Footer (Fixed at bottom)
```
─────────────────────────────────────────────────────────────────
                 Merci pour votre confiance !
    Facture générée automatiquement. Valable sans signature.
                FAC-20260109-001 • Page 1/1
─────────────────────────────────────────────────────────────────
```

---

## Features

### Status Badges
| Status | French | Arabic | Color |
|--------|--------|--------|-------|
| completed | Payée | مكتملة | Green |
| pending | En attente | قيد الانتظار | Yellow |
| cancelled | Annulée | ملغاة | Red |

### Cancelled Invoice Watermark
Cancelled invoices display a large diagonal "ANNULÉE" (or "ملغاة" for Arabic) watermark across the document with 12% opacity.

### Bilingual Support
- **French (default)**: `lang=fr`, LTR direction
- **Arabic**: `lang=ar`, RTL direction with proper text alignment

### Payment Information
For cash payments, if `amount_received` is recorded:
- Shows "Montant reçu" (amount received)
- Shows "Monnaie rendue" (change given)

---

## Customization

### Branding Information

All branding comes from the `settings` table:

| Setting | Description |
|---------|-------------|
| `store_name` | Company name displayed in header |
| `owner_name` | Owner/manager name |
| `address` | Business address |
| `phone` | Contact phone |
| `email` | Contact email |
| `tax_id` | NIF (Numéro d'Identification Fiscale) |
| `rc_number` | RC (Registre de Commerce) |
| `invoice_footer` | Custom thank-you message |

### Modifying Colors

The color scheme uses professional grayscale with accents:

```css
/* Primary dark color (headers, titles) */
#2c3e50

/* Status colors */
.status-completed: #28a745 (green)
.status-pending:   #ffc107 (yellow)  
.status-cancelled: #dc3545 (red)

/* Discount/negative values */
.discount-value: #dc3545 (red)

/* Change/positive values */
.change-row: #28a745 (green)
```

### Adding Logo

To add a company logo, modify the header section in `invoice.blade.php`:

```html
<td class="company-info">
    @if($settings->logo)
    <img src="{{ storage_path('app/public/' . $settings->logo) }}" 
         style="max-height: 15mm; margin-bottom: 3mm;">
    @endif
    <div class="company-name">...</div>
</td>
```

---

## Technical Details

### DomPDF Limitations

The template is designed with DomPDF's limitations in mind:

| Feature | Status | Notes |
|---------|--------|-------|
| Flexbox | ❌ | Use `display: table` instead |
| CSS Grid | ❌ | Use tables for layout |
| Gradients | ⚠️ | Limited support, use solid colors |
| Transform | ⚠️ | Only `rotate()` works reliably |
| Position fixed | ✅ | Works for footer/watermark |
| @page rules | ✅ | For margins, page breaks |
| Web fonts | ❌ | Use embedded TTF fonts |

### Font Support

The template uses DejaVu Sans, which supports:
- Latin characters (French)
- Arabic script
- Numbers and symbols

Font files should be located at:
```
storage/fonts/DejaVuSans.ttf
storage/fonts/DejaVuSans-Bold.ttf
```

### Paper Size

Default: A4 (210mm × 297mm)

To change, modify in controller:
```php
$pdf->setPaper('A4');        // A4
$pdf->setPaper('Letter');    // US Letter
$pdf->setPaper([0, 0, 226.77, 566.93]); // Custom (80mm thermal)
```

---

## Usage

### Generate PDF via Browser

```
GET /bills/{id}/pdf         → French PDF
GET /bills/{id}/pdf/ar      → Arabic PDF
```

### Generate PDF Programmatically

```php
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Bill;
use App\Models\Setting;

$bill = Bill::with(['items.product', 'worker', 'user'])->find($id);
$settings = Setting::instance();

$pdf = Pdf::loadView('bills.invoice', [
    'bill' => $bill,
    'settings' => $settings,
    'lang' => 'fr',
    'isRtl' => false,
]);

// Download
return $pdf->download("facture-{$bill->bill_number}.pdf");

// Save to file
$pdf->save(storage_path("invoices/{$bill->bill_number}.pdf"));

// Stream in browser
return $pdf->stream("facture-{$bill->bill_number}.pdf");
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Arabic text not rendering | Ensure DejaVu fonts are in `storage/fonts/` |
| Blank PDF | Check Laravel logs for Blade errors |
| Watermark not showing | Verify `position: fixed` is not overridden |
| Table breaking badly | Add `page-break-inside: avoid` to rows |
| Numbers misaligned | Use monospace font family for amounts |

### Testing

Run the test script to generate sample PDFs:

```bash
php test-invoice-pdf.php
```

This creates test PDFs in `storage/app/test-pdfs/`:
- `test-simple-invoice.pdf` - Basic invoice
- `test-large-invoice.pdf` - Many items
- `test-cancelled-invoice.pdf` - With watermark
- `test-arabic-invoice.pdf` - RTL layout

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-01-09 | Complete redesign with professional structure |
| 1.0.0 | — | Initial implementation |

---

## File Locations

```
app/
└── Http/
    └── Controllers/
        └── BillsController.php          # downloadPdf() method

resources/
└── views/
    └── bills/
        └── invoice.blade.php            # PDF template

storage/
├── fonts/
│   ├── DejaVuSans.ttf                   # Regular font
│   └── DejaVuSans-Bold.ttf              # Bold font
└── app/
    └── test-pdfs/                       # Test output directory

docs/
└── PDF_INVOICE.md                       # This documentation
```
