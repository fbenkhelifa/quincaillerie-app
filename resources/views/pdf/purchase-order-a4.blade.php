<!DOCTYPE html>
<html lang="{{ $lang }}" dir="{{ $lang === 'ar' ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ __('Bon de Commande') }} {{ $order->po_number }}</title>
    <style>
        /*
        ============================================================
        A4 PURCHASE ORDER PDF - ENTERPRISE GRADE
        ============================================================
        Paper: A4 (210mm × 297mm)
        Margins: 15mm all sides (bottom 20mm for footer)
        Printable Width: 180mm
        ============================================================
        */
        
        /* A4 PAGE CONFIGURATION */
        @page {
            size: A4 portrait;
            margin: 15mm 15mm 20mm 15mm;
        }
        
        /* FONT SETUP */
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
        
        /* RESET & BASE */
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
            direction: {{ $lang === 'ar' ? 'rtl' : 'ltr' }};
            width: 100%;
        }
        
        /* A4 CONTAINER */
        .container {
            width: 100%;
            max-width: 180mm;
            margin: 0;
            padding: 0;
        }
        
        /* HEADER */
        .header {
            width: 100%;
            margin-bottom: 5mm;
            border-bottom: 1.5pt solid #43a047;
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
        
        .header-left {
            width: 55%;
        }
        
        .header-right {
            width: 45%;
            text-align: {{ $lang === 'ar' ? 'left' : 'right' }};
        }
        
        .store-name {
            font-size: 15pt;
            font-weight: bold;
            color: #43a047;
            margin-bottom: 2mm;
            line-height: 1.2;
        }
        
        .store-info {
            font-size: 7.5pt;
            color: #4a5568;
            line-height: 1.5;
        }
        
        .store-info p {
            margin: 0 0 0.5mm 0;
        }
        
        .po-title {
            font-size: 18pt;
            font-weight: bold;
            color: #1a252f;
            margin-bottom: 2mm;
        }
        
        .po-number {
            display: inline-block;
            background: #43a047;
            color: #ffffff;
            padding: 1.5mm 4mm;
            font-size: 10pt;
            font-weight: bold;
            margin-bottom: 2mm;
        }
        
        /* STATUS BADGES */
        .status-badge {
            display: inline-block;
            padding: 1mm 3mm;
            font-size: 7pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3pt;
        }
        
        .status-draft {
            background: #e2e8f0;
            color: #4a5568;
            border: 0.3pt solid #cbd5e0;
        }
        
        .status-sent {
            background: #dbeafe;
            color: #1e40af;
            border: 0.3pt solid #bfdbfe;
        }
        
        .status-partial {
            background: #fed7aa;
            color: #9a3412;
            border: 0.3pt solid #fdba74;
        }
        
        .status-received {
            background: #d1fae5;
            color: #065f46;
            border: 0.3pt solid #a7f3d0;
        }
        
        .status-cancelled {
            background: #fecaca;
            color: #991b1b;
            border: 0.3pt solid #fca5a5;
        }
        
        /* DATES SECTION */
        .dates-section {
            width: 100%;
            margin-bottom: 4mm;
            page-break-inside: avoid;
        }
        
        .dates-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }
        
        .date-cell {
            width: 33.33%;
            text-align: center;
            padding: 2mm;
            border: 0.4pt solid #e2e8f0;
            background: #f7fafc;
        }
        
        .date-label {
            font-size: 6.5pt;
            color: #718096;
            text-transform: uppercase;
            margin-bottom: 1mm;
        }
        
        .date-value {
            font-size: 9pt;
            font-weight: bold;
            color: #1a252f;
        }
        
        /* INFO SECTION */
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
            padding: {{ $lang === 'ar' ? '0 0 0 2mm' : '0 2mm 0 0' }};
        }
        
        .info-table td:last-child {
            padding: {{ $lang === 'ar' ? '0 2mm 0 0' : '0 0 0 2mm' }};
        }
        
        .info-box {
            border: 0.4pt solid #e2e8f0;
            background: #f7fafc;
            padding: 2.5mm;
            height: 100%;
        }
        
        .info-title {
            font-size: 6.5pt;
            font-weight: bold;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.3pt;
            margin-bottom: 1.5mm;
            padding-bottom: 1mm;
            border-bottom: 0.3pt solid #e2e8f0;
        }
        
        .info-name {
            font-size: 9pt;
            font-weight: bold;
            color: #1a252f;
            margin-bottom: 1mm;
        }
        
        .info-detail {
            font-size: 7.5pt;
            color: #4a5568;
            line-height: 1.4;
            margin: 0 0 0.5mm 0;
        }
        
        /* ITEMS TABLE - A4 OPTIMIZED
           Total width: 180mm
           #: 8mm (4.4%), Désignation: 72mm (40%), Qté: 26mm (14.4%), P.U.: 36mm (20%), Total: 38mm (21.1%)
        */
        .items-section {
            margin-bottom: 4mm;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 8pt;
        }
        
        .items-table thead {
            display: table-header-group;
        }
        
        .items-table tbody {
            display: table-row-group;
        }
        
        .items-table th {
            background: #43a047;
            color: #ffffff;
            font-weight: bold;
            padding: 2mm 1.5mm;
            font-size: 7pt;
            text-transform: uppercase;
            letter-spacing: 0.2pt;
            border: none;
            text-align: {{ $lang === 'ar' ? 'right' : 'left' }};
        }
        
        .items-table .col-num { width: 4.4%; text-align: center; }
        .items-table .col-desc { width: 40%; text-align: {{ $lang === 'ar' ? 'right' : 'left' }}; }
        .items-table .col-qty { width: 14.4%; text-align: center; }
        .items-table .col-price { width: 20%; text-align: {{ $lang === 'ar' ? 'left' : 'right' }}; }
        .items-table .col-total { width: 21.1%; text-align: {{ $lang === 'ar' ? 'left' : 'right' }}; }
        
        .items-table td {
            padding: 1.8mm 1.5mm;
            border-bottom: 0.3pt solid #e2e8f0;
            vertical-align: middle;
            word-wrap: break-word;
        }
        
        .items-table tr {
            page-break-inside: avoid;
        }
        
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
        
        .product-name {
            font-weight: bold;
            color: #1a252f;
            font-size: 8pt;
            line-height: 1.3;
        }
        
        .product-sku {
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
        
        /* TOTALS SECTION */
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
            float: {{ $lang === 'ar' ? 'left' : 'right' }};
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
            text-align: {{ $lang === 'ar' ? 'right' : 'left' }};
            color: #4a5568;
            width: 55%;
        }
        
        .totals-table .value {
            text-align: {{ $lang === 'ar' ? 'left' : 'right' }};
            font-weight: bold;
            white-space: nowrap;
            width: 45%;
        }
        
        .totals-table .total-row {
            background: #43a047;
            color: #ffffff;
        }
        
        .totals-table .total-row td {
            padding: 2mm 1.5mm;
            font-size: 10pt;
            font-weight: bold;
        }
        
        /* NOTES SECTION */
        .notes-section {
            background: #fef3c7;
            border: 0.4pt solid #fcd34d;
            border-{{ $lang === 'ar' ? 'right' : 'left' }}: 2pt solid #f59e0b;
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
        
        /* FOOTER */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            border-top: 0.4pt solid #e2e8f0;
            padding-top: 2.5mm;
            background: #ffffff;
            font-size: 6.5pt;
            color: #718096;
        }
        
        /* PRINT OPTIMIZATION */
        @media print {
            html, body {
                width: 210mm;
                height: 297mm;
            }
            
            body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        {{-- HEADER --}}
        <div class="header">
            <table class="header-table">
                <tr>
                    <td class="header-left">
                        <div class="store-name">{{ $settings['store_name'] ?? 'Quincaillerie' }}</div>
                        <div class="store-info">
                            @if(!empty($settings['store_address']))
                                <p>{{ $settings['store_address'] }}</p>
                            @endif
                            @if(!empty($settings['store_phone']))
                                <p>{{ __('Tél') }}: {{ $settings['store_phone'] }}</p>
                            @endif
                            @if(!empty($settings['store_email']))
                                <p>{{ $settings['store_email'] }}</p>
                            @endif
                        </div>
                    </td>
                    <td class="header-right">
                        <div class="po-title">{{ __('BON DE COMMANDE') }}</div>
                        <div class="po-number">{{ $order->po_number }}</div>
                        <div style="margin-top: 2mm;">
                            <span class="status-badge status-{{ $order->status }}">
                                {{ strtoupper($order->status) }}
                            </span>
                        </div>
                    </td>
                </tr>
            </table>
        </div>

        {{-- DATES --}}
        <div class="dates-section">
            <table class="dates-table">
                <tr>
                    <td class="date-cell">
                        <div class="date-label">{{ __('Date de commande') }}</div>
                        <div class="date-value">{{ $order->order_date?->format('d/m/Y') ?? '-' }}</div>
                    </td>
                    <td class="date-cell">
                        <div class="date-label">{{ __('Date prévue') }}</div>
                        <div class="date-value">{{ $order->expected_date?->format('d/m/Y') ?? '-' }}</div>
                    </td>
                    <td class="date-cell">
                        <div class="date-label">{{ __('Date réception') }}</div>
                        <div class="date-value">{{ $order->received_date?->format('d/m/Y') ?? '-' }}</div>
                    </td>
                </tr>
            </table>
        </div>

        {{-- SUPPLIER & DELIVERY INFO --}}
        <div class="info-section">
            <table class="info-table">
                <tr>
                    <td>
                        <div class="info-box">
                            <div class="info-title">{{ __('Fournisseur') }}</div>
                            <div class="info-name">{{ $order->supplier->name }}</div>
                            @if($order->supplier->contact_name)
                                <p class="info-detail"><strong>{{ __('Contact') }}:</strong> {{ $order->supplier->contact_name }}</p>
                            @endif
                            @if($order->supplier->phone)
                                <p class="info-detail"><strong>{{ __('Tél') }}:</strong> {{ $order->supplier->phone }}</p>
                            @endif
                            @if($order->supplier->email)
                                <p class="info-detail">{{ $order->supplier->email }}</p>
                            @endif
                            @if($order->supplier->address)
                                <p class="info-detail">{{ $order->supplier->address }}</p>
                            @endif
                            @if($order->supplier->city)
                                <p class="info-detail">{{ $order->supplier->city }}</p>
                            @endif
                        </div>
                    </td>
                    <td>
                        <div class="info-box">
                            <div class="info-title">{{ __('Livraison à') }}</div>
                            <div class="info-name">{{ $settings['store_name'] ?? 'Quincaillerie' }}</div>
                            @if(!empty($settings['store_address']))
                                <p class="info-detail">{{ $settings['store_address'] }}</p>
                            @endif
                            @if(!empty($settings['store_phone']))
                                <p class="info-detail"><strong>{{ __('Tél') }}:</strong> {{ $settings['store_phone'] }}</p>
                            @endif
                        </div>
                    </td>
                </tr>
            </table>
        </div>

        {{-- ITEMS TABLE --}}
        <div class="items-section">
            <table class="items-table">
                <thead>
                    <tr>
                        <th class="col-num">#</th>
                        <th class="col-desc">{{ __('Désignation') }}</th>
                        <th class="col-qty">{{ __('Quantité') }}</th>
                        <th class="col-price">{{ __('Prix unitaire') }}</th>
                        <th class="col-total">{{ __('Total') }}</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $index => $item)
                    <tr>
                        <td class="col-num">{{ $index + 1 }}</td>
                        <td class="col-desc">
                            <div class="product-name">{{ $item->product_name }}</div>
                            @if($item->product_sku)
                                <div class="product-sku">{{ __('Réf') }}: {{ $item->product_sku }}</div>
                            @endif
                        </td>
                        <td class="col-qty">
                            <span class="qty-value">{{ number_format($item->quantity_ordered, $item->quantity_ordered == intval($item->quantity_ordered) ? 0 : 2, ',', ' ') }}</span>
                            @if($item->unit)
                                <span class="qty-unit">{{ $item->unit }}</span>
                            @endif
                        </td>
                        <td class="col-price">{{ number_format($item->unit_cost, 2, ',', ' ') }}</td>
                        <td class="col-total">{{ number_format($item->total, 2, ',', ' ') }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        {{-- TOTALS --}}
        <div class="totals-section clearfix">
            <div class="totals-wrapper">
                <div class="totals-box">
                    <table class="totals-table">
                        <tr>
                            <td class="label">{{ __('Sous-total') }}</td>
                            <td class="value">{{ number_format($order->subtotal, 2, ',', ' ') }} DA</td>
                        </tr>
                        @if(($order->tax ?? 0) > 0)
                        <tr>
                            <td class="label">{{ __('Taxes') }}</td>
                            <td class="value">{{ number_format($order->tax, 2, ',', ' ') }} DA</td>
                        </tr>
                        @endif
                        @if(($order->shipping ?? 0) > 0)
                        <tr>
                            <td class="label">{{ __('Frais de livraison') }}</td>
                            <td class="value">{{ number_format($order->shipping, 2, ',', ' ') }} DA</td>
                        </tr>
                        @endif
                        <tr class="total-row">
                            <td class="label">{{ __('TOTAL') }}</td>
                            <td class="value">{{ number_format($order->total, 2, ',', ' ') }} DA</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>

        {{-- NOTES --}}
        @if($order->supplier_notes)
        <div class="notes-section">
            <div class="notes-title">{{ __('Notes pour le fournisseur') }}</div>
            <div class="notes-content">{{ $order->supplier_notes }}</div>
        </div>
        @endif

        {{-- FOOTER --}}
        <div class="footer">
            {{ __('Document généré le') }} {{ now()->format('d/m/Y H:i') }} | 
            {{ $settings['store_name'] ?? 'Quincaillerie' }} | 
            {{ $order->po_number }}
        </div>
    </div>
</body>
</html>
