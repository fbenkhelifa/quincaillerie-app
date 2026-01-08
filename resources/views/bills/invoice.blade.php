<!DOCTYPE html>
<html lang="{{ $lang }}" dir="{{ $lang === 'ar' ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ __('Facture') }} {{ $bill->bill_number }}</title>
    <style>
        @if($lang === 'ar')
        @font-face {
            font-family: 'DejaVu Sans';
            src: url('{{ storage_path("fonts/DejaVuSans.ttf") }}') format('truetype');
        }
        @endif
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            direction: {{ $lang === 'ar' ? 'rtl' : 'ltr' }};
        }
        
        .container {
            width: 100%;
            padding: 20px;
        }
        
        .header {
            display: table;
            width: 100%;
            margin-bottom: 30px;
            border-bottom: 2px solid #1976d2;
            padding-bottom: 20px;
        }
        
        .header-left, .header-right {
            display: table-cell;
            vertical-align: top;
            width: 50%;
        }
        
        .header-right {
            text-align: {{ $lang === 'ar' ? 'left' : 'right' }};
        }
        
        .store-name {
            font-size: 24px;
            font-weight: bold;
            color: #1976d2;
            margin-bottom: 5px;
        }
        
        .store-info {
            color: #666;
            font-size: 11px;
        }
        
        .invoice-title {
            font-size: 28px;
            font-weight: bold;
            color: #333;
        }
        
        .invoice-number {
            font-size: 16px;
            color: #1976d2;
            margin-top: 5px;
        }
        
        .invoice-date {
            color: #666;
            margin-top: 5px;
        }
        
        .info-section {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        
        .info-box {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }
        
        .info-title {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        
        .info-content {
            font-weight: bold;
        }
        
        table.items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        table.items th {
            background-color: #f5f5f5;
            padding: 10px;
            text-align: {{ $lang === 'ar' ? 'right' : 'left' }};
            border-bottom: 2px solid #ddd;
            font-size: 11px;
            text-transform: uppercase;
        }
        
        table.items th.right {
            text-align: {{ $lang === 'ar' ? 'left' : 'right' }};
        }
        
        table.items td {
            padding: 10px;
            border-bottom: 1px solid #eee;
        }
        
        table.items td.right {
            text-align: {{ $lang === 'ar' ? 'left' : 'right' }};
        }
        
        table.items td.center {
            text-align: center;
        }
        
        .totals {
            width: 300px;
            {{ $lang === 'ar' ? 'margin-left: 0; margin-right: auto;' : 'margin-left: auto; margin-right: 0;' }}
        }
        
        .totals-row {
            display: table;
            width: 100%;
            padding: 5px 0;
        }
        
        .totals-label {
            display: table-cell;
            width: 50%;
        }
        
        .totals-value {
            display: table-cell;
            width: 50%;
            text-align: {{ $lang === 'ar' ? 'left' : 'right' }};
        }
        
        .totals-row.total {
            border-top: 2px solid #333;
            margin-top: 10px;
            padding-top: 10px;
            font-size: 16px;
            font-weight: bold;
        }
        
        .totals-row.total .totals-value {
            color: #1976d2;
        }
        
        .notes {
            margin-top: 30px;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
        }
        
        .notes-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            border-top: 1px dashed #ccc;
            padding-top: 20px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 3px;
            font-size: 10px;
            text-transform: uppercase;
        }
        
        .status-completed { background-color: #e8f5e9; color: #2e7d32; }
        .status-pending { background-color: #fff3e0; color: #f57c00; }
        .status-cancelled { background-color: #ffebee; color: #c62828; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-left">
                <div class="store-name">
                    {{ $lang === 'ar' ? ($settings['store_name_ar'] ?? $settings['store_name']) : $settings['store_name'] }}
                </div>
                @if($settings['owner_name'] ?? null)
                <div class="store-info">
                    {{ $lang === 'ar' ? ($settings['owner_name_ar'] ?? $settings['owner_name']) : $settings['owner_name'] }}
                </div>
                @endif
                @if($settings['address'] ?? null)
                <div class="store-info">
                    {{ $lang === 'ar' ? ($settings['address_ar'] ?? $settings['address']) : $settings['address'] }}
                </div>
                @endif
                @if($settings['phone'] ?? null)
                <div class="store-info">{{ $lang === 'ar' ? 'هاتف' : 'Tél' }}: {{ $settings['phone'] }}</div>
                @endif
                @if($settings['tax_id'] ?? null)
                <div class="store-info">{{ $lang === 'ar' ? 'رقم التعريف الجبائي' : 'NIF' }}: {{ $settings['tax_id'] }}</div>
                @endif
                @if($settings['rc_number'] ?? null)
                <div class="store-info">{{ $lang === 'ar' ? 'السجل التجاري' : 'RC' }}: {{ $settings['rc_number'] }}</div>
                @endif
            </div>
            <div class="header-right">
                <div class="invoice-title">{{ $lang === 'ar' ? 'فاتورة' : 'FACTURE' }}</div>
                <div class="invoice-number">{{ $bill->bill_number }}</div>
                <div class="invoice-date">
                    {{ $lang === 'ar' ? 'التاريخ' : 'Date' }}: {{ $bill->created_at->format('d/m/Y H:i') }}
                </div>
                <div style="margin-top: 10px;">
                    <span class="status-badge status-{{ $bill->status }}">
                        @if($lang === 'ar')
                            @switch($bill->status)
                                @case('completed') مكتملة @break
                                @case('pending') قيد الانتظار @break
                                @case('cancelled') ملغاة @break
                            @endswitch
                        @else
                            @switch($bill->status)
                                @case('completed') Terminée @break
                                @case('pending') En attente @break
                                @case('cancelled') Annulée @break
                            @endswitch
                        @endif
                    </span>
                </div>
            </div>
        </div>

        <!-- Customer & Seller Info -->
        <div class="info-section">
            <div class="info-box">
                <div class="info-title">{{ $lang === 'ar' ? 'الزبون' : 'Client' }}</div>
                <div class="info-content">
                    {{ $bill->customer_name ?: ($lang === 'ar' ? 'زبون مجهول' : 'Client anonyme') }}
                </div>
                @if($bill->customer_phone)
                <div>{{ $bill->customer_phone }}</div>
                @endif
            </div>
            <div class="info-box">
                <div class="info-title">{{ $lang === 'ar' ? 'البائع' : 'Vendeur' }}</div>
                <div class="info-content">{{ $bill->worker?->name ?? '-' }}</div>
                <div>
                    {{ $lang === 'ar' ? 'طريقة الدفع' : 'Mode de paiement' }}:
                    @if($lang === 'ar')
                        @switch($bill->payment_method)
                            @case('cash') نقدا @break
                            @case('card') بطاقة @break
                            @case('check') شيك @break
                            @case('credit') دين @break
                            @default أخرى @break
                        @endswitch
                    @else
                        @switch($bill->payment_method)
                            @case('cash') Espèces @break
                            @case('card') Carte @break
                            @case('check') Chèque @break
                            @case('credit') Crédit @break
                            @default Autre @break
                        @endswitch
                    @endif
                </div>
            </div>
        </div>

        <!-- Items Table -->
        <table class="items">
            <thead>
                <tr>
                    <th>{{ $lang === 'ar' ? 'المنتج' : 'Produit' }}</th>
                    <th class="right">{{ $lang === 'ar' ? 'الكمية' : 'Qté' }}</th>
                    <th class="right">{{ $lang === 'ar' ? 'السعر الوحدوي' : 'Prix unit.' }}</th>
                    <th class="right">{{ $lang === 'ar' ? 'الخصم' : 'Remise' }}</th>
                    <th class="right">{{ $lang === 'ar' ? 'المجموع' : 'Total' }}</th>
                </tr>
            </thead>
            <tbody>
                @foreach($bill->items as $item)
                <tr>
                    <td>
                        {{ $item->product_name }}<br>
                        @if($item->product_sku)
                        <small style="color: #666;">SKU: {{ $item->product_sku }}</small>
                        @endif
                    </td>
                    <td class="center">{{ $item->quantity }} {{ $item->unit }}</td>
                    <td class="right">{{ number_format($item->unit_price, 2) }} DA</td>
                    <td class="right">{{ $item->discount > 0 ? number_format($item->discount, 2) . ' DA' : '-' }}</td>
                    <td class="right">{{ number_format($item->total, 2) }} DA</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
            <div class="totals-row">
                <div class="totals-label">{{ $lang === 'ar' ? 'المجموع الفرعي' : 'Sous-total' }}:</div>
                <div class="totals-value">{{ number_format($bill->subtotal, 2) }} DA</div>
            </div>
            @if($bill->discount > 0)
            <div class="totals-row">
                <div class="totals-label">{{ $lang === 'ar' ? 'الخصم' : 'Remise' }}:</div>
                <div class="totals-value" style="color: #c62828;">-{{ number_format($bill->discount, 2) }} DA</div>
            </div>
            @endif
            @if($bill->tax > 0)
            <div class="totals-row">
                <div class="totals-label">{{ $lang === 'ar' ? 'الضريبة' : 'Taxe' }}:</div>
                <div class="totals-value">{{ number_format($bill->tax, 2) }} DA</div>
            </div>
            @endif
            <div class="totals-row total">
                <div class="totals-label">{{ $lang === 'ar' ? 'المجموع الكلي' : 'Total' }}:</div>
                <div class="totals-value">{{ number_format($bill->total, 2) }} DA</div>
            </div>
        </div>

        <!-- Notes -->
        @if($bill->notes)
        <div class="notes">
            <div class="notes-title">{{ $lang === 'ar' ? 'ملاحظات' : 'Notes' }}:</div>
            <div>{{ $bill->notes }}</div>
        </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            {{ $lang === 'ar' ? ($settings['invoice_footer_ar'] ?? 'شكرا لتسوقكم!') : ($settings['invoice_footer'] ?? 'Merci pour votre achat!') }}
        </div>
    </div>
</body>
</html>
