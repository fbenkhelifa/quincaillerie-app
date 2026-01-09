<!DOCTYPE html>
<html lang="{{ $lang }}" dir="{{ $isRtl ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ $isRtl ? 'فاتورة' : 'Facture' }} {{ $bill->bill_number }}</title>
    <style>
        /* ============================================
           PROFESSIONAL INVOICE PDF TEMPLATE
           Compatible with DomPDF - Print-Safe Design
           ============================================ */
        
        /* Font Setup - DejaVu Sans for Arabic/French support */
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
        
        /* Reset & Base */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #1a1a1a;
            background: #ffffff;
            direction: {{ $isRtl ? 'rtl' : 'ltr' }};
        }
        
        /* Page Container */
        .invoice-page {
            width: 100%;
            padding: 15mm 15mm 20mm 15mm;
            position: relative;
        }
        
        /* ============================================
           CANCELLED WATERMARK
           ============================================ */
        .watermark {
            position: fixed;
            top: 35%;
            left: 15%;
            width: 70%;
            text-align: center;
            font-size: 72pt;
            font-weight: bold;
            color: #ff0000;
            opacity: 0.12;
            transform: rotate(-35deg);
            transform-origin: center center;
            z-index: 1000;
            letter-spacing: 8px;
        }
        
        /* ============================================
           HEADER SECTION
           ============================================ */
        .header {
            width: 100%;
            margin-bottom: 8mm;
            border-bottom: 2pt solid #2c3e50;
            padding-bottom: 6mm;
        }
        
        .header-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .header-table td {
            vertical-align: top;
            padding: 0;
        }
        
        .company-info {
            width: 55%;
        }
        
        .invoice-info {
            width: 45%;
            text-align: {{ $isRtl ? 'left' : 'right' }};
        }
        
        .company-name {
            font-size: 18pt;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 3mm;
            letter-spacing: -0.5px;
        }
        
        .company-details {
            font-size: 8pt;
            color: #555555;
            line-height: 1.6;
        }
        
        .company-details p {
            margin: 0 0 1mm 0;
        }
        
        .invoice-title {
            font-size: 22pt;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 4mm;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .invoice-meta {
            font-size: 9pt;
            color: #333333;
            line-height: 1.8;
        }
        
        .invoice-meta strong {
            color: #1a1a1a;
        }
        
        .invoice-number-box {
            display: inline-block;
            background-color: #2c3e50;
            color: #ffffff;
            padding: 3mm 5mm;
            margin-bottom: 3mm;
            font-size: 11pt;
            font-weight: bold;
        }
        
        /* ============================================
           STATUS BADGE
           ============================================ */
        .status-badge {
            display: inline-block;
            padding: 1.5mm 4mm;
            font-size: 7pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2mm;
        }
        
        .status-completed {
            background-color: #d4edda;
            color: #155724;
            border: 0.5pt solid #28a745;
        }
        
        .status-pending {
            background-color: #fff3cd;
            color: #856404;
            border: 0.5pt solid #ffc107;
        }
        
        .status-cancelled {
            background-color: #f8d7da;
            color: #721c24;
            border: 0.5pt solid #dc3545;
        }
        
        /* ============================================
           CLIENT & TRANSACTION INFO
           ============================================ */
        .info-section {
            width: 100%;
            margin-bottom: 6mm;
        }
        
        .info-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .info-table td {
            width: 50%;
            vertical-align: top;
            padding: 0;
        }
        
        .info-box {
            background-color: #f8f9fa;
            border: 0.5pt solid #dee2e6;
            padding: 4mm;
            margin-{{ $isRtl ? 'left' : 'right' }}: 3mm;
        }
        
        .info-box:last-child {
            margin-{{ $isRtl ? 'left' : 'right' }}: 0;
            margin-{{ $isRtl ? 'right' : 'left' }}: 3mm;
        }
        
        .info-box-title {
            font-size: 7pt;
            font-weight: bold;
            text-transform: uppercase;
            color: #6c757d;
            letter-spacing: 0.5px;
            margin-bottom: 2mm;
            padding-bottom: 1.5mm;
            border-bottom: 0.5pt solid #dee2e6;
        }
        
        .info-box-content {
            font-size: 9pt;
            color: #1a1a1a;
        }
        
        .info-box-content p {
            margin: 0 0 1mm 0;
        }
        
        .info-box-content .primary {
            font-size: 10pt;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .info-box-content .secondary {
            font-size: 8pt;
            color: #6c757d;
        }
        
        /* ============================================
           ITEMS TABLE
           ============================================ */
        .items-section {
            margin-bottom: 6mm;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
        }
        
        .items-table thead tr {
            background-color: #2c3e50;
            color: #ffffff;
        }
        
        .items-table th {
            padding: 3mm 2mm;
            text-align: {{ $isRtl ? 'right' : 'left' }};
            font-size: 7pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: none;
        }
        
        .items-table th.num {
            width: 6%;
            text-align: center;
        }
        
        .items-table th.desc {
            width: 36%;
        }
        
        .items-table th.qty {
            width: 12%;
            text-align: center;
        }
        
        .items-table th.price {
            width: 16%;
            text-align: {{ $isRtl ? 'left' : 'right' }};
        }
        
        .items-table th.disc {
            width: 12%;
            text-align: {{ $isRtl ? 'left' : 'right' }};
        }
        
        .items-table th.total {
            width: 18%;
            text-align: {{ $isRtl ? 'left' : 'right' }};
        }
        
        .items-table tbody tr {
            border-bottom: 0.5pt solid #dee2e6;
        }
        
        .items-table tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .items-table td {
            padding: 2.5mm 2mm;
            vertical-align: top;
        }
        
        .items-table td.num {
            text-align: center;
            color: #6c757d;
            font-size: 8pt;
        }
        
        .items-table td.qty {
            text-align: center;
        }
        
        .items-table td.price,
        .items-table td.disc,
        .items-table td.total {
            text-align: {{ $isRtl ? 'left' : 'right' }};
            font-family: 'DejaVu Sans', monospace;
        }
        
        .product-name {
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 0.5mm;
        }
        
        .product-ref {
            font-size: 7pt;
            color: #6c757d;
        }
        
        .qty-value {
            font-weight: bold;
        }
        
        .qty-unit {
            font-size: 7pt;
            color: #6c757d;
        }
        
        .discount-value {
            color: #dc3545;
        }
        
        .line-total {
            font-weight: bold;
            color: #1a1a1a;
        }
        
        /* ============================================
           TOTALS SECTION
           ============================================ */
        .totals-section {
            width: 100%;
            margin-bottom: 6mm;
        }
        
        .totals-wrapper {
            width: 100%;
        }
        
        .totals-table-container {
            width: 45%;
            float: {{ $isRtl ? 'left' : 'right' }};
        }
        
        .totals-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
        }
        
        .totals-table tr {
            border-bottom: 0.5pt solid #e9ecef;
        }
        
        .totals-table td {
            padding: 2mm 3mm;
        }
        
        .totals-table .label {
            text-align: {{ $isRtl ? 'right' : 'left' }};
            color: #495057;
        }
        
        .totals-table .value {
            text-align: {{ $isRtl ? 'left' : 'right' }};
            font-family: 'DejaVu Sans', monospace;
            font-weight: bold;
        }
        
        .totals-table .discount-row .value {
            color: #dc3545;
        }
        
        .totals-table .grand-total {
            background-color: #2c3e50;
            color: #ffffff;
            border: none;
        }
        
        .totals-table .grand-total td {
            padding: 3mm;
            font-size: 11pt;
            font-weight: bold;
        }
        
        .payment-row {
            background-color: #e9ecef;
        }
        
        .change-row .value {
            color: #28a745;
            font-weight: bold;
        }
        
        .clearfix::after {
            content: "";
            display: table;
            clear: both;
        }
        
        /* ============================================
           NOTES SECTION
           ============================================ */
        .notes-section {
            background-color: #fffbf0;
            border: 0.5pt solid #f0e6d3;
            padding: 3mm 4mm;
            margin-bottom: 6mm;
        }
        
        .notes-title {
            font-size: 7pt;
            font-weight: bold;
            text-transform: uppercase;
            color: #8a6d3b;
            margin-bottom: 1.5mm;
        }
        
        .notes-content {
            font-size: 8pt;
            color: #5d4e37;
            line-height: 1.5;
        }
        
        /* ============================================
           FOOTER
           ============================================ */
        .footer {
            position: fixed;
            bottom: 10mm;
            left: 15mm;
            right: 15mm;
            text-align: center;
            border-top: 0.5pt solid #dee2e6;
            padding-top: 4mm;
        }
        
        .footer-message {
            font-size: 10pt;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 2mm;
        }
        
        .footer-legal {
            font-size: 7pt;
            color: #6c757d;
            line-height: 1.5;
        }
        
        .footer-legal p {
            margin: 0 0 0.5mm 0;
        }
        
        .page-number {
            font-size: 7pt;
            color: #adb5bd;
            margin-top: 2mm;
        }
        
        /* ============================================
           PRINT OPTIMIZATION
           ============================================ */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
        
        /* Page break handling for long invoices */
        .items-table thead {
            display: table-header-group;
        }
        
        .items-table tbody {
            display: table-row-group;
        }
        
        .items-table tr {
            page-break-inside: avoid;
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
                    <td class="company-info">
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
                    <td class="invoice-info">
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
                        <th class="num">#</th>
                        <th class="desc">{{ $isRtl ? 'المنتج' : 'Désignation' }}</th>
                        <th class="qty">{{ $isRtl ? 'الكمية' : 'Qté' }}</th>
                        <th class="price">{{ $isRtl ? 'السعر' : 'P.U.' }}</th>
                        <th class="disc">{{ $isRtl ? 'خصم' : 'Remise' }}</th>
                        <th class="total">{{ $isRtl ? 'المجموع' : 'Total' }}</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($bill->items as $index => $item)
                    <tr>
                        <td class="num">{{ $index + 1 }}</td>
                        <td class="desc">
                            <div class="product-name">{{ $item->product_name }}</div>
                            @if($item->product_sku ?? $item->product?->sku)
                            <div class="product-ref">{{ $isRtl ? 'المرجع' : 'Réf' }}: {{ $item->product_sku ?? $item->product?->sku }}</div>
                            @endif
                        </td>
                        <td class="qty">
                            <span class="qty-value">{{ number_format($item->quantity, $item->quantity == intval($item->quantity) ? 0 : 2, ',', ' ') }}</span>
                            @if($item->unit ?? $item->product?->unit)
                            <span class="qty-unit">{{ $item->unit ?? $item->product?->unit }}</span>
                            @endif
                        </td>
                        <td class="price">{{ number_format($item->unit_price, 2, ',', ' ') }}</td>
                        <td class="disc">
                            @if(($item->discount ?? 0) > 0)
                            <span class="discount-value">-{{ number_format($item->discount, 2, ',', ' ') }}</span>
                            @else
                            <span style="color: #adb5bd;">—</span>
                            @endif
                        </td>
                        <td class="total">
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
                <div class="totals-table-container">
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
                        <tr class="grand-total">
                            <td class="label">{{ $isRtl ? 'المجموع الكلي' : 'TOTAL TTC' }}</td>
                            <td class="value">{{ number_format($bill->total, 2, ',', ' ') }} DA</td>
                        </tr>
                        @if($bill->payment_method === 'cash' && ($bill->amount_received ?? 0) > 0)
                        <tr class="payment-row">
                            <td class="label">{{ $isRtl ? 'المبلغ المستلم' : 'Montant reçu' }}</td>
                            <td class="value">{{ number_format($bill->amount_received, 2, ',', ' ') }} DA</td>
                        </tr>
                        <tr class="change-row">
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
