<!DOCTYPE html>
<html lang="{{ $lang }}" dir="{{ $isRtl ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ $isRtl ? 'فاتورة' : 'Facture' }} {{ $bill->bill_number }}</title>
    <style>
        /*
        ============================================================
        A4 INVOICE PDF TEMPLATE - ENTERPRISE GRADE
        ============================================================
        Paper: A4 (210mm × 297mm)
        Margins: 15mm all sides (bottom 20mm for footer)
        Printable Content Width: 180mm
        Printable Content Height: 262mm (297 - 15 - 20)
        ============================================================
        */
        
        /* ============================================
           A4 PAGE SIZE CONFIGURATION
           ============================================ */
        @page {
            size: A4 portrait;
            margin: 15mm 15mm 20mm 15mm;
        }
        
        /* ============================================
           FONT CONFIGURATION - DejaVu Sans
           ============================================ */
        @font-face {
            font-family: 'DejaVu Sans';
            src: url('{{ storage_path("fonts/DejaVuSans.ttf") }}') format('truetype');
            font-weight: normal;
            font-style: normal;
        }
        
        @font-face {
            font-family: 'DejaVu Sans';
            src: url('{{ storage_path("fonts/DejaVuSans-Bold.ttf") }}') format('truetype');
            font-weight: bold;
            font-style: normal;
        }
        
        /* ============================================
           CSS RESET & BASE
           ============================================ */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        html {
            font-size: 9pt;
        }
        
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 9pt;
            line-height: 1.35;
            color: #1a1a1a;
            background: #ffffff;
            direction: {{ $isRtl ? 'rtl' : 'ltr' }};
            width: 100%;
        }
        
        /* ============================================
           A4 PAGE CONTAINER
           Content fits within 180mm width
           ============================================ */
        .invoice-page {
            width: 100%;
            max-width: 180mm;
            margin: 0;
            padding: 0;
            position: relative;
        }
        
        /* ============================================
           CANCELLED INVOICE WATERMARK
           ============================================ */
        .watermark {
            position: fixed;
            top: 40%;
            left: 20%;
            font-size: 54pt;
            font-weight: bold;
            color: rgba(220, 53, 69, 0.12);
            text-transform: uppercase;
            transform: rotate(-35deg);
            white-space: nowrap;
            z-index: 1000;
            letter-spacing: 4pt;
        }
        
        /* ============================================
           HEADER SECTION
           ============================================ */
        .header {
            width: 100%;
            margin-bottom: 5mm;
            border-bottom: 1.5pt solid #1a252f;
            padding-bottom: 4mm;
            page-break-inside: avoid;
        }
        
        .header-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }
        
        .header-table td {
            vertical-align: top;
            padding: 0;
        }
        
        .company-col {
            width: 55%;
        }
        
        .invoice-col {
            width: 45%;
            text-align: {{ $isRtl ? 'left' : 'right' }};
        }
        
        .company-name {
            font-size: 15pt;
            font-weight: bold;
            color: #1a252f;
            margin-bottom: 2mm;
            line-height: 1.2;
        }
        
        .company-details {
            font-size: 7.5pt;
            color: #4a5568;
            line-height: 1.5;
        }
        
        .company-details p {
            margin: 0 0 0.5mm 0;
        }
        
        .invoice-title {
            font-size: 18pt;
            font-weight: bold;
            color: #1a252f;
            text-transform: uppercase;
            letter-spacing: 1pt;
            margin-bottom: 2mm;
        }
        
        .invoice-number-box {
            display: inline-block;
            background: #1a252f;
            color: #ffffff;
            padding: 1.5mm 4mm;
            font-size: 10pt;
            font-weight: bold;
            margin-bottom: 2mm;
        }
        
        .invoice-meta {
            font-size: 8pt;
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 2mm;
        }
        
        .invoice-meta p {
            margin: 0 0 0.5mm 0;
        }
        
        /* ============================================
           STATUS BADGES
           ============================================ */
        .status-badge {
            display: inline-block;
            padding: 1mm 3mm;
            font-size: 7pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3pt;
        }
        
        .status-completed {
            background: #d4edda;
            color: #155724;
            border: 0.3pt solid #c3e6cb;
        }
        
        .status-pending {
            background: #fff3cd;
            color: #856404;
            border: 0.3pt solid #ffeeba;
        }
        
        .status-cancelled {
            background: #f8d7da;
            color: #721c24;
            border: 0.3pt solid #f5c6cb;
        }
        
        /* ============================================
           CLIENT & TRANSACTION INFO
           ============================================ */
        .info-section {
            margin-bottom: 4mm;
            page-break-inside: avoid;
        }
        
        .info-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }
        
        .info-table td {
            width: 50%;
            vertical-align: top;
            padding: {{ $isRtl ? '0 0 0 2mm' : '0 2mm 0 0' }};
        }
        
        .info-table td:last-child {
            padding: {{ $isRtl ? '0 2mm 0 0' : '0 0 0 2mm' }};
        }
        
        .info-box {
            border: 0.4pt solid #e2e8f0;
            background: #f7fafc;
            padding: 2.5mm;
            height: 100%;
        }
        
        .info-box-title {
            font-size: 6.5pt;
            font-weight: bold;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.3pt;
            margin-bottom: 1.5mm;
            padding-bottom: 1mm;
            border-bottom: 0.3pt solid #e2e8f0;
        }
        
        .info-box-content {
            font-size: 8pt;
            line-height: 1.4;
        }
        
        .info-box-content p {
            margin: 0 0 0.5mm 0;
        }
        
        .info-box-content .primary {
            font-weight: bold;
            color: #1a252f;
            font-size: 9pt;
        }
        
        .info-box-content .secondary {
            color: #718096;
            font-size: 7.5pt;
        }
        
        /* ============================================
           ITEMS TABLE - A4 OPTIMIZED
           Total width: 180mm
           Column breakdown:
             # (num):    8mm  = 4.4%
             Produit:   70mm  = 38.9%
             Qté:       18mm  = 10.0%
             P.U.:      28mm  = 15.6%
             Remise:    22mm  = 12.2%
             Total:     34mm  = 18.9%
             TOTAL:    180mm  = 100%
           ============================================ */
        .items-section {
            margin-bottom: 4mm;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 8pt;
        }
        
        /* Repeating header on multi-page invoices */
        .items-table thead {
            display: table-header-group;
        }
        
        .items-table tbody {
            display: table-row-group;
        }
        
        .items-table th {
            background: #1a252f;
            color: #ffffff;
            font-weight: bold;
            padding: 2mm 1.5mm;
            font-size: 7pt;
            text-transform: uppercase;
            letter-spacing: 0.2pt;
            border: none;
            text-align: {{ $isRtl ? 'right' : 'left' }};
        }
        
        /* Column widths - A4 optimized */
        .items-table .col-num { width: 4.4%; text-align: center; }
        .items-table .col-desc { width: 38.9%; text-align: {{ $isRtl ? 'right' : 'left' }}; }
        .items-table .col-qty { width: 10.0%; text-align: center; }
        .items-table .col-price { width: 15.6%; text-align: {{ $isRtl ? 'left' : 'right' }}; }
        .items-table .col-disc { width: 12.2%; text-align: {{ $isRtl ? 'left' : 'right' }}; }
        .items-table .col-total { width: 18.9%; text-align: {{ $isRtl ? 'left' : 'right' }}; }
        
        .items-table td {
            padding: 1.8mm 1.5mm;
            border-bottom: 0.3pt solid #e2e8f0;
            vertical-align: middle;
            word-wrap: break-word;
            overflow: hidden;
        }
        
        /* Prevent rows from breaking across pages */
        .items-table tr {
            page-break-inside: avoid;
        }
        
        /* Zebra striping */
        .items-table tbody tr:nth-child(even) {
            background: #f8fafc;
        }
        
        .items-table .col-num {
            color: #a0aec0;
            font-size: 7pt;
        }
        
        .items-table td.col-total {
            font-weight: bold;
        }
        
        /* Product cell styling */
        .product-name {
            font-weight: bold;
            color: #1a252f;
            font-size: 8pt;
            line-height: 1.3;
        }
        
        .product-ref {
            font-size: 6.5pt;
            color: #a0aec0;
            margin-top: 0.3mm;
        }
        
        .qty-value {
            font-weight: bold;
            font-size: 8pt;
        }
        
        .qty-unit {
            display: block;
            font-size: 6pt;
            color: #a0aec0;
        }
        
        .discount-value {
            color: #e53e3e;
            font-size: 7.5pt;
        }
        
        .no-discount {
            color: #cbd5e0;
        }
        
        .line-total {
            color: #1a252f;
            font-size: 8pt;
        }
        
        /* ============================================
           TOTALS SECTION
           ============================================ */
        .totals-section {
            margin-bottom: 4mm;
            page-break-inside: avoid;
        }
        
        .clearfix::after {
            content: "";
            display: table;
            clear: both;
        }
        
        .totals-wrapper {
            float: {{ $isRtl ? 'left' : 'right' }};
            width: 46%;
            max-width: 82mm;
        }
        
        .totals-box {
            background: #f7fafc;
            border: 0.4pt solid #e2e8f0;
            padding: 2.5mm;
        }
        
        .totals-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
        }
        
        .totals-table td {
            padding: 1.2mm 1.5mm;
        }
        
        .totals-table .label {
            text-align: {{ $isRtl ? 'right' : 'left' }};
            color: #4a5568;
            width: 55%;
        }
        
        .totals-table .value {
            text-align: {{ $isRtl ? 'left' : 'right' }};
            font-weight: bold;
            white-space: nowrap;
            width: 45%;
        }
        
        .totals-table .discount-row td {
            color: #e53e3e;
        }
        
        .totals-table .grand-total-row {
            border-top: 0.8pt solid #1a252f;
        }
        
        .totals-table .grand-total-row td {
            padding-top: 2mm;
            font-size: 10pt;
        }
        
        .totals-table .grand-total-row .label {
            font-weight: bold;
            color: #1a252f;
        }
        
        .totals-table .grand-total-row .value {
            color: #1a252f;
            font-size: 11pt;
        }
        
        .totals-table .payment-info td {
            font-size: 7pt;
            color: #718096;
            padding: 0.8mm 1.5mm;
        }
        
        /* ============================================
           NOTES SECTION
           ============================================ */
        .notes-section {
            background: #fffbeb;
            border: 0.4pt solid #fcd34d;
            border-{{ $isRtl ? 'right' : 'left' }}: 2pt solid #f59e0b;
            padding: 2.5mm;
            margin-bottom: 4mm;
            page-break-inside: avoid;
        }
        
        .notes-title {
            font-size: 6.5pt;
            font-weight: bold;
            color: #92400e;
            text-transform: uppercase;
            letter-spacing: 0.2pt;
            margin-bottom: 1mm;
        }
        
        .notes-content {
            font-size: 8pt;
            color: #4a5568;
            line-height: 1.4;
        }
        
        /* ============================================
           FIXED FOOTER
           ============================================ */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            border-top: 0.4pt solid #e2e8f0;
            padding-top: 2.5mm;
            background: #ffffff;
        }
        
        .footer-message {
            font-size: 9pt;
            font-weight: bold;
            color: #1a252f;
            margin-bottom: 1.5mm;
        }
        
        .footer-legal {
            font-size: 6.5pt;
            color: #718096;
            line-height: 1.4;
        }
        
        .footer-legal p {
            margin: 0 0 0.3mm 0;
        }
        
        .page-number {
            font-size: 6pt;
            color: #a0aec0;
            margin-top: 1.5mm;
        }
        
        /* ============================================
           PAGE BREAK UTILITIES
           ============================================ */
        .page-break {
            page-break-after: always;
        }
        
        .no-break {
            page-break-inside: avoid;
        }
        
        /* ============================================
           PRINT OPTIMIZATION
           ============================================ */
        @media print {
            html, body {
                width: 210mm;
                height: 297mm;
            }
            
            body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
        }
    </style>
</head>
<body>
    {{-- Cancelled Invoice Watermark --}}
    @if($bill->status === 'cancelled')
    <div class="watermark">{{ $isRtl ? 'ملغاة' : 'ANNULÉE' }}</div>
    @endif

    <div class="invoice-page">
        {{-- ============================================
            HEADER SECTION
            ============================================ --}}
        <div class="header">
            <table class="header-table">
                <tr>
                    <td class="company-col">
                        <div class="company-name">
                            {{ $isRtl ? ($settings->store_name_ar ?? $settings->store_name ?? 'المتجر') : ($settings->store_name ?? 'Quincaillerie') }}
                        </div>
                        <div class="company-details">
                            @if($settings->owner_name)
                            <p><strong>{{ $isRtl ? ($settings->owner_name_ar ?? $settings->owner_name) : $settings->owner_name }}</strong></p>
                            @endif
                            @if($settings->address)
                            <p>{{ $isRtl ? ($settings->address_ar ?? $settings->address) : $settings->address }}</p>
                            @endif
                            @if($settings->phone)
                            <p>{{ $isRtl ? 'الهاتف' : 'Tél' }}: {{ $settings->phone }}</p>
                            @endif
                            @if($settings->email ?? null)
                            <p>{{ $settings->email }}</p>
                            @endif
                            @if($settings->tax_id)
                            <p>{{ $isRtl ? 'الرقم الجبائي' : 'NIF' }}: {{ $settings->tax_id }}</p>
                            @endif
                            @if($settings->rc_number ?? null)
                            <p>{{ $isRtl ? 'السجل التجاري' : 'RC' }}: {{ $settings->rc_number }}</p>
                            @endif
                        </div>
                    </td>
                    <td class="invoice-col">
                        <div class="invoice-title">{{ $isRtl ? 'فاتورة' : 'FACTURE' }}</div>
                        <div class="invoice-number-box">{{ $bill->bill_number }}</div>
                        <div class="invoice-meta">
                            <p><strong>{{ $isRtl ? 'التاريخ' : 'Date' }}:</strong> {{ $bill->created_at->format('d/m/Y') }}</p>
                            <p><strong>{{ $isRtl ? 'الوقت' : 'Heure' }}:</strong> {{ $bill->created_at->format('H:i') }}</p>
                        </div>
                        <span class="status-badge status-{{ $bill->status }}">
                            @if($isRtl)
                                @switch($bill->status)
                                    @case('completed') مكتملة @break
                                    @case('pending') قيد الانتظار @break
                                    @case('cancelled') ملغاة @break
                                    @default {{ $bill->status }}
                                @endswitch
                            @else
                                @switch($bill->status)
                                    @case('completed') Payée @break
                                    @case('pending') En attente @break
                                    @case('cancelled') Annulée @break
                                    @default {{ ucfirst($bill->status) }}
                                @endswitch
                            @endif
                        </span>
                    </td>
                </tr>
            </table>
        </div>

        {{-- ============================================
            CLIENT & TRANSACTION INFO
            ============================================ --}}
        <div class="info-section">
            <table class="info-table">
                <tr>
                    <td>
                        <div class="info-box">
                            <div class="info-box-title">{{ $isRtl ? 'العميل' : 'Client' }}</div>
                            <div class="info-box-content">
                                <p class="primary">{{ $bill->customer_name ?: ($isRtl ? 'عميل عابر' : 'Client comptoir') }}</p>
                                @if($bill->customer_phone)
                                <p class="secondary">{{ $isRtl ? 'الهاتف' : 'Tél' }}: {{ $bill->customer_phone }}</p>
                                @endif
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="info-box">
                            <div class="info-box-title">{{ $isRtl ? 'معلومات المعاملة' : 'Transaction' }}</div>
                            <div class="info-box-content">
                                <p><strong>{{ $isRtl ? 'البائع' : 'Vendeur' }}:</strong> {{ $bill->worker?->name ?? '-' }}</p>
                                <p><strong>{{ $isRtl ? 'طريقة الدفع' : 'Paiement' }}:</strong> 
                                    @if($isRtl)
                                        @switch($bill->payment_method)
                                            @case('cash') نقداً @break
                                            @case('card') بطاقة @break
                                            @case('check') شيك @break
                                            @case('credit') آجل @break
                                            @default {{ $bill->payment_method }}
                                        @endswitch
                                    @else
                                        @switch($bill->payment_method)
                                            @case('cash') Espèces @break
                                            @case('card') Carte bancaire @break
                                            @case('check') Chèque @break
                                            @case('credit') Crédit @break
                                            @default {{ ucfirst($bill->payment_method) }}
                                        @endswitch
                                    @endif
                                </p>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
        </div>

        {{-- ============================================
            ITEMS TABLE
            ============================================ --}}
        <div class="items-section">
            <table class="items-table">
                <thead>
                    <tr>
                        <th class="col-num">#</th>
                        <th class="col-desc">{{ $isRtl ? 'المنتج' : 'Désignation' }}</th>
                        <th class="col-qty">{{ $isRtl ? 'الكمية' : 'Qté' }}</th>
                        <th class="col-price">{{ $isRtl ? 'السعر' : 'P.U.' }}</th>
                        <th class="col-disc">{{ $isRtl ? 'خصم' : 'Remise' }}</th>
                        <th class="col-total">{{ $isRtl ? 'المجموع' : 'Total' }}</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($bill->items as $index => $item)
                    <tr>
                        <td class="col-num">{{ $index + 1 }}</td>
                        <td class="col-desc">
                            <div class="product-name">{{ $item->product_name }}</div>
                            @if($item->product_sku ?? $item->product?->sku)
                            <div class="product-ref">{{ $isRtl ? 'المرجع' : 'Réf' }}: {{ $item->product_sku ?? $item->product?->sku }}</div>
                            @endif
                        </td>
                        <td class="col-qty">
                            <span class="qty-value">{{ number_format($item->quantity, $item->quantity == intval($item->quantity) ? 0 : 2, ',', ' ') }}</span>
                            @if($item->unit ?? $item->product?->unit)
                            <span class="qty-unit">{{ $item->unit ?? $item->product?->unit }}</span>
                            @endif
                        </td>
                        <td class="col-price">{{ number_format($item->unit_price, 2, ',', ' ') }}</td>
                        <td class="col-disc">
                            @if(($item->discount ?? 0) > 0)
                            <span class="discount-value">-{{ number_format($item->discount, 2, ',', ' ') }}</span>
                            @else
                            <span class="no-discount">—</span>
                            @endif
                        </td>
                        <td class="col-total">
                            <span class="line-total">{{ number_format($item->total, 2, ',', ' ') }}</span>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        {{-- ============================================
            TOTALS SECTION
            ============================================ --}}
        <div class="totals-section clearfix">
            <div class="totals-wrapper">
                <div class="totals-box">
                    <table class="totals-table">
                        <tr>
                            <td class="label">{{ $isRtl ? 'المجموع الفرعي' : 'Sous-total' }}</td>
                            <td class="value">{{ number_format($bill->subtotal, 2, ',', ' ') }} DA</td>
                        </tr>
                        @if(($bill->discount ?? 0) > 0)
                        <tr class="discount-row">
                            <td class="label">{{ $isRtl ? 'الخصم' : 'Remise' }}</td>
                            <td class="value">-{{ number_format($bill->discount, 2, ',', ' ') }} DA</td>
                        </tr>
                        @endif
                        @if(($bill->tax ?? 0) > 0)
                        <tr>
                            <td class="label">{{ $isRtl ? 'الضريبة' : 'TVA' }}</td>
                            <td class="value">{{ number_format($bill->tax, 2, ',', ' ') }} DA</td>
                        </tr>
                        @endif
                        <tr class="grand-total-row">
                            <td class="label">{{ $isRtl ? 'المجموع الكلي' : 'TOTAL TTC' }}</td>
                            <td class="value">{{ number_format($bill->total, 2, ',', ' ') }} DA</td>
                        </tr>
                        @if($bill->payment_method === 'cash' && ($bill->amount_received ?? 0) > 0)
                        <tr class="payment-info">
                            <td class="label">{{ $isRtl ? 'المبلغ المستلم' : 'Montant reçu' }}</td>
                            <td class="value">{{ number_format($bill->amount_received, 2, ',', ' ') }} DA</td>
                        </tr>
                        <tr class="payment-info">
                            <td class="label">{{ $isRtl ? 'الباقي' : 'Monnaie rendue' }}</td>
                            <td class="value">{{ number_format($bill->amount_received - $bill->total, 2, ',', ' ') }} DA</td>
                        </tr>
                        @endif
                    </table>
                </div>
            </div>
        </div>

        {{-- ============================================
            NOTES SECTION
            ============================================ --}}
        @if($bill->notes)
        <div class="notes-section">
            <div class="notes-title">{{ $isRtl ? 'ملاحظات' : 'Remarques' }}</div>
            <div class="notes-content">{{ $bill->notes }}</div>
        </div>
        @endif

        {{-- ============================================
            FOOTER
            ============================================ --}}
        <div class="footer">
            <div class="footer-message">
                {{ $isRtl ? ($settings->invoice_footer_ar ?? 'شكراً لتعاملكم معنا!') : ($settings->invoice_footer ?? 'Merci pour votre confiance !') }}
            </div>
            <div class="footer-legal">
                <p>{{ $isRtl ? 'هذه الفاتورة صادرة آلياً وصالحة بدون توقيع أو ختم.' : 'Facture générée automatiquement. Valable sans signature ni cachet.' }}</p>
                <p>{{ $isRtl ? 'للاستفسارات، يرجى الاتصال بنا.' : 'Pour toute question, veuillez nous contacter.' }}</p>
            </div>
            <div class="page-number">
                {{ $bill->bill_number }} • {{ $isRtl ? 'صفحة' : 'Page' }} 1/1
            </div>
        </div>
    </div>
</body>
</html>
