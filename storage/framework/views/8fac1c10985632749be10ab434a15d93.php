<!DOCTYPE html>
<html lang="<?php echo e($lang); ?>" dir="<?php echo e($lang === 'ar' ? 'rtl' : 'ltr'); ?>">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title><?php echo e(__('Facture')); ?> <?php echo e($bill->bill_number); ?></title>
    <style>
        <?php if($lang === 'ar'): ?>
        @font-face {
            font-family: 'DejaVu Sans';
            src: url('<?php echo e(storage_path("fonts/DejaVuSans.ttf")); ?>') format('truetype');
        }
        <?php endif; ?>
        
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
            direction: <?php echo e($lang === 'ar' ? 'rtl' : 'ltr'); ?>;
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
            text-align: <?php echo e($lang === 'ar' ? 'left' : 'right'); ?>;
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
            text-align: <?php echo e($lang === 'ar' ? 'right' : 'left'); ?>;
            border-bottom: 2px solid #ddd;
            font-size: 11px;
            text-transform: uppercase;
        }
        
        table.items th.right {
            text-align: <?php echo e($lang === 'ar' ? 'left' : 'right'); ?>;
        }
        
        table.items td {
            padding: 10px;
            border-bottom: 1px solid #eee;
        }
        
        table.items td.right {
            text-align: <?php echo e($lang === 'ar' ? 'left' : 'right'); ?>;
        }
        
        table.items td.center {
            text-align: center;
        }
        
        .totals {
            width: 300px;
            <?php echo e($lang === 'ar' ? 'margin-left: 0; margin-right: auto;' : 'margin-left: auto; margin-right: 0;'); ?>

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
            text-align: <?php echo e($lang === 'ar' ? 'left' : 'right'); ?>;
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
                    <?php echo e($lang === 'ar' ? ($settings['store_name_ar'] ?? $settings['store_name']) : $settings['store_name']); ?>

                </div>
                <?php if($settings['owner_name'] ?? null): ?>
                <div class="store-info">
                    <?php echo e($lang === 'ar' ? ($settings['owner_name_ar'] ?? $settings['owner_name']) : $settings['owner_name']); ?>

                </div>
                <?php endif; ?>
                <?php if($settings['address'] ?? null): ?>
                <div class="store-info">
                    <?php echo e($lang === 'ar' ? ($settings['address_ar'] ?? $settings['address']) : $settings['address']); ?>

                </div>
                <?php endif; ?>
                <?php if($settings['phone'] ?? null): ?>
                <div class="store-info"><?php echo e($lang === 'ar' ? 'هاتف' : 'Tél'); ?>: <?php echo e($settings['phone']); ?></div>
                <?php endif; ?>
                <?php if($settings['tax_id'] ?? null): ?>
                <div class="store-info"><?php echo e($lang === 'ar' ? 'رقم التعريف الجبائي' : 'NIF'); ?>: <?php echo e($settings['tax_id']); ?></div>
                <?php endif; ?>
                <?php if($settings['rc_number'] ?? null): ?>
                <div class="store-info"><?php echo e($lang === 'ar' ? 'السجل التجاري' : 'RC'); ?>: <?php echo e($settings['rc_number']); ?></div>
                <?php endif; ?>
            </div>
            <div class="header-right">
                <div class="invoice-title"><?php echo e($lang === 'ar' ? 'فاتورة' : 'FACTURE'); ?></div>
                <div class="invoice-number"><?php echo e($bill->bill_number); ?></div>
                <div class="invoice-date">
                    <?php echo e($lang === 'ar' ? 'التاريخ' : 'Date'); ?>: <?php echo e($bill->created_at->format('d/m/Y H:i')); ?>

                </div>
                <div style="margin-top: 10px;">
                    <span class="status-badge status-<?php echo e($bill->status); ?>">
                        <?php if($lang === 'ar'): ?>
                            <?php switch($bill->status):
                                case ('completed'): ?> مكتملة <?php break; ?>
                                <?php case ('pending'): ?> قيد الانتظار <?php break; ?>
                                <?php case ('cancelled'): ?> ملغاة <?php break; ?>
                            <?php endswitch; ?>
                        <?php else: ?>
                            <?php switch($bill->status):
                                case ('completed'): ?> Terminée <?php break; ?>
                                <?php case ('pending'): ?> En attente <?php break; ?>
                                <?php case ('cancelled'): ?> Annulée <?php break; ?>
                            <?php endswitch; ?>
                        <?php endif; ?>
                    </span>
                </div>
            </div>
        </div>

        <!-- Customer & Seller Info -->
        <div class="info-section">
            <div class="info-box">
                <div class="info-title"><?php echo e($lang === 'ar' ? 'الزبون' : 'Client'); ?></div>
                <div class="info-content">
                    <?php echo e($bill->customer_name ?: ($lang === 'ar' ? 'زبون مجهول' : 'Client anonyme')); ?>

                </div>
                <?php if($bill->customer_phone): ?>
                <div><?php echo e($bill->customer_phone); ?></div>
                <?php endif; ?>
            </div>
            <div class="info-box">
                <div class="info-title"><?php echo e($lang === 'ar' ? 'البائع' : 'Vendeur'); ?></div>
                <div class="info-content"><?php echo e($bill->worker?->name ?? '-'); ?></div>
                <div>
                    <?php echo e($lang === 'ar' ? 'طريقة الدفع' : 'Mode de paiement'); ?>:
                    <?php if($lang === 'ar'): ?>
                        <?php switch($bill->payment_method):
                            case ('cash'): ?> نقدا <?php break; ?>
                            <?php case ('card'): ?> بطاقة <?php break; ?>
                            <?php case ('check'): ?> شيك <?php break; ?>
                            <?php case ('credit'): ?> دين <?php break; ?>
                            <?php default: ?> أخرى <?php break; ?>
                        <?php endswitch; ?>
                    <?php else: ?>
                        <?php switch($bill->payment_method):
                            case ('cash'): ?> Espèces <?php break; ?>
                            <?php case ('card'): ?> Carte <?php break; ?>
                            <?php case ('check'): ?> Chèque <?php break; ?>
                            <?php case ('credit'): ?> Crédit <?php break; ?>
                            <?php default: ?> Autre <?php break; ?>
                        <?php endswitch; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Items Table -->
        <table class="items">
            <thead>
                <tr>
                    <th><?php echo e($lang === 'ar' ? 'المنتج' : 'Produit'); ?></th>
                    <th class="right"><?php echo e($lang === 'ar' ? 'الكمية' : 'Qté'); ?></th>
                    <th class="right"><?php echo e($lang === 'ar' ? 'السعر الوحدوي' : 'Prix unit.'); ?></th>
                    <th class="right"><?php echo e($lang === 'ar' ? 'الخصم' : 'Remise'); ?></th>
                    <th class="right"><?php echo e($lang === 'ar' ? 'المجموع' : 'Total'); ?></th>
                </tr>
            </thead>
            <tbody>
                <?php $__currentLoopData = $bill->items; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <tr>
                    <td>
                        <?php echo e($item->product_name); ?><br>
                        <?php if($item->product_sku): ?>
                        <small style="color: #666;">SKU: <?php echo e($item->product_sku); ?></small>
                        <?php endif; ?>
                    </td>
                    <td class="center"><?php echo e($item->quantity); ?> <?php echo e($item->unit); ?></td>
                    <td class="right"><?php echo e(number_format($item->unit_price, 2)); ?> DA</td>
                    <td class="right"><?php echo e($item->discount > 0 ? number_format($item->discount, 2) . ' DA' : '-'); ?></td>
                    <td class="right"><?php echo e(number_format($item->total, 2)); ?> DA</td>
                </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
            <div class="totals-row">
                <div class="totals-label"><?php echo e($lang === 'ar' ? 'المجموع الفرعي' : 'Sous-total'); ?>:</div>
                <div class="totals-value"><?php echo e(number_format($bill->subtotal, 2)); ?> DA</div>
            </div>
            <?php if($bill->discount > 0): ?>
            <div class="totals-row">
                <div class="totals-label"><?php echo e($lang === 'ar' ? 'الخصم' : 'Remise'); ?>:</div>
                <div class="totals-value" style="color: #c62828;">-<?php echo e(number_format($bill->discount, 2)); ?> DA</div>
            </div>
            <?php endif; ?>
            <?php if($bill->tax > 0): ?>
            <div class="totals-row">
                <div class="totals-label"><?php echo e($lang === 'ar' ? 'الضريبة' : 'Taxe'); ?>:</div>
                <div class="totals-value"><?php echo e(number_format($bill->tax, 2)); ?> DA</div>
            </div>
            <?php endif; ?>
            <div class="totals-row total">
                <div class="totals-label"><?php echo e($lang === 'ar' ? 'المجموع الكلي' : 'Total'); ?>:</div>
                <div class="totals-value"><?php echo e(number_format($bill->total, 2)); ?> DA</div>
            </div>
        </div>

        <!-- Notes -->
        <?php if($bill->notes): ?>
        <div class="notes">
            <div class="notes-title"><?php echo e($lang === 'ar' ? 'ملاحظات' : 'Notes'); ?>:</div>
            <div><?php echo e($bill->notes); ?></div>
        </div>
        <?php endif; ?>

        <!-- Footer -->
        <div class="footer">
            <?php echo e($lang === 'ar' ? ($settings['invoice_footer_ar'] ?? 'شكرا لتسوقكم!') : ($settings['invoice_footer'] ?? 'Merci pour votre achat!')); ?>

        </div>
    </div>
</body>
</html>
<?php /**PATH C:\laragon\www\quincaillerie-app\resources\views/bills/invoice.blade.php ENDPATH**/ ?>