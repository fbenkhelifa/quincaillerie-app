<!DOCTYPE html>
<html lang="<?php echo e($lang); ?>" dir="<?php echo e($lang === 'ar' ? 'rtl' : 'ltr'); ?>">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title><?php echo e(__('Bon de Commande')); ?> <?php echo e($order->po_number); ?></title>
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
            border-bottom: 2px solid #4caf50;
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
            color: #4caf50;
            margin-bottom: 5px;
        }
        
        .store-info {
            color: #666;
            font-size: 11px;
        }
        
        .po-title {
            font-size: 28px;
            font-weight: bold;
            color: #333;
        }
        
        .po-number {
            font-size: 16px;
            color: #4caf50;
            margin-top: 5px;
        }
        
        .po-date {
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
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-<?php echo e($lang === 'ar' ? 'left' : 'right'); ?>: 10px;
        }
        
        .info-name {
            font-size: 14px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        
        .info-detail {
            color: #666;
            font-size: 11px;
            margin-bottom: 2px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .items-table th {
            background-color: #4caf50;
            color: white;
            padding: 12px 8px;
            text-align: <?php echo e($lang === 'ar' ? 'right' : 'left'); ?>;
            font-size: 11px;
            text-transform: uppercase;
        }
        
        .items-table th.number {
            text-align: center;
        }
        
        .items-table th.amount {
            text-align: <?php echo e($lang === 'ar' ? 'left' : 'right'); ?>;
        }
        
        .items-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 11px;
        }
        
        .items-table td.number {
            text-align: center;
        }
        
        .items-table td.amount {
            text-align: <?php echo e($lang === 'ar' ? 'left' : 'right'); ?>;
        }
        
        .items-table tr:nth-child(even) {
            background-color: #fafafa;
        }
        
        .product-name {
            font-weight: bold;
            color: #333;
        }
        
        .product-sku {
            color: #999;
            font-size: 10px;
        }
        
        .totals-section {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        
        .totals-spacer {
            display: table-cell;
            width: 60%;
        }
        
        .totals-box {
            display: table-cell;
            width: 40%;
        }
        
        .totals-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .totals-table td {
            padding: 8px 12px;
        }
        
        .totals-table .label {
            color: #666;
        }
        
        .totals-table .value {
            text-align: <?php echo e($lang === 'ar' ? 'left' : 'right'); ?>;
            font-weight: bold;
        }
        
        .totals-table .total-row {
            background-color: #4caf50;
            color: white;
        }
        
        .totals-table .total-row td {
            font-size: 14px;
            padding: 12px;
        }
        
        .notes-section {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        
        .notes-title {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        
        .notes-content {
            color: #666;
            font-size: 11px;
        }
        
        .footer {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            text-align: center;
            color: #999;
            font-size: 10px;
            border-top: 1px solid #e0e0e0;
            padding-top: 10px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-draft { background-color: #e0e0e0; color: #666; }
        .status-sent { background-color: #e3f2fd; color: #1976d2; }
        .status-partial { background-color: #fff3e0; color: #f57c00; }
        .status-received { background-color: #e8f5e9; color: #388e3c; }
        .status-cancelled { background-color: #ffebee; color: #d32f2f; }

        .dates-section {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }

        .date-box {
            display: table-cell;
            width: 33%;
            text-align: center;
            padding: 10px;
        }

        .date-label {
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
        }

        .date-value {
            font-size: 14px;
            font-weight: bold;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-left">
                <div class="store-name"><?php echo e($settings['store_name'] ?? 'Quincaillerie'); ?></div>
                <div class="store-info">
                    <?php if(!empty($settings['store_address'])): ?>
                        <?php echo e($settings['store_address']); ?><br>
                    <?php endif; ?>
                    <?php if(!empty($settings['store_phone'])): ?>
                        <?php echo e(__('Tél')); ?>: <?php echo e($settings['store_phone']); ?><br>
                    <?php endif; ?>
                    <?php if(!empty($settings['store_email'])): ?>
                        <?php echo e($settings['store_email']); ?>

                    <?php endif; ?>
                </div>
            </div>
            <div class="header-right">
                <div class="po-title"><?php echo e(__('BON DE COMMANDE')); ?></div>
                <div class="po-number"><?php echo e($order->po_number); ?></div>
                <div class="po-date">
                    <span class="status-badge status-<?php echo e($order->status); ?>">
                        <?php echo e($order->status_label); ?>

                    </span>
                </div>
            </div>
        </div>

        <!-- Dates -->
        <div class="dates-section">
            <div class="date-box">
                <div class="date-label"><?php echo e(__('Date de commande')); ?></div>
                <div class="date-value"><?php echo e($order->order_date?->format('d/m/Y')); ?></div>
            </div>
            <div class="date-box">
                <div class="date-label"><?php echo e(__('Date prévue')); ?></div>
                <div class="date-value"><?php echo e($order->expected_date?->format('d/m/Y') ?? '-'); ?></div>
            </div>
            <div class="date-box">
                <div class="date-label"><?php echo e(__('Date réception')); ?></div>
                <div class="date-value"><?php echo e($order->received_date?->format('d/m/Y') ?? '-'); ?></div>
            </div>
        </div>

        <!-- Supplier Info -->
        <div class="info-section">
            <div class="info-box">
                <div class="info-title"><?php echo e(__('Fournisseur')); ?></div>
                <div class="info-content">
                    <div class="info-name"><?php echo e($order->supplier->name); ?></div>
                    <?php if($order->supplier->contact_name): ?>
                        <div class="info-detail"><?php echo e(__('Contact')); ?>: <?php echo e($order->supplier->contact_name); ?></div>
                    <?php endif; ?>
                    <?php if($order->supplier->phone): ?>
                        <div class="info-detail"><?php echo e(__('Tél')); ?>: <?php echo e($order->supplier->phone); ?></div>
                    <?php endif; ?>
                    <?php if($order->supplier->email): ?>
                        <div class="info-detail"><?php echo e($order->supplier->email); ?></div>
                    <?php endif; ?>
                    <?php if($order->supplier->address): ?>
                        <div class="info-detail"><?php echo e($order->supplier->address); ?></div>
                    <?php endif; ?>
                    <?php if($order->supplier->city): ?>
                        <div class="info-detail"><?php echo e($order->supplier->city); ?></div>
                    <?php endif; ?>
                </div>
            </div>
            <div class="info-box">
                <div class="info-title"><?php echo e(__('Livraison à')); ?></div>
                <div class="info-content">
                    <div class="info-name"><?php echo e($settings['store_name'] ?? 'Quincaillerie'); ?></div>
                    <?php if(!empty($settings['store_address'])): ?>
                        <div class="info-detail"><?php echo e($settings['store_address']); ?></div>
                    <?php endif; ?>
                    <?php if(!empty($settings['store_phone'])): ?>
                        <div class="info-detail"><?php echo e(__('Tél')); ?>: <?php echo e($settings['store_phone']); ?></div>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 5%;">#</th>
                    <th style="width: 40%;"><?php echo e(__('Désignation')); ?></th>
                    <th class="number" style="width: 15%;"><?php echo e(__('Quantité')); ?></th>
                    <th class="amount" style="width: 20%;"><?php echo e(__('Prix unitaire')); ?></th>
                    <th class="amount" style="width: 20%;"><?php echo e(__('Total')); ?></th>
                </tr>
            </thead>
            <tbody>
                <?php $__currentLoopData = $order->items; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $index => $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <tr>
                    <td><?php echo e($index + 1); ?></td>
                    <td>
                        <div class="product-name"><?php echo e($item->product_name); ?></div>
                        <?php if($item->product_sku): ?>
                            <div class="product-sku"><?php echo e($item->product_sku); ?></div>
                        <?php endif; ?>
                    </td>
                    <td class="number"><?php echo e(number_format($item->quantity_ordered, 2)); ?> <?php echo e($item->unit); ?></td>
                    <td class="amount"><?php echo e(number_format($item->unit_cost, 2)); ?> DA</td>
                    <td class="amount"><?php echo e(number_format($item->total, 2)); ?> DA</td>
                </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-section">
            <div class="totals-spacer"></div>
            <div class="totals-box">
                <table class="totals-table">
                    <tr>
                        <td class="label"><?php echo e(__('Sous-total')); ?></td>
                        <td class="value"><?php echo e(number_format($order->subtotal, 2)); ?> DA</td>
                    </tr>
                    <?php if($order->tax > 0): ?>
                    <tr>
                        <td class="label"><?php echo e(__('Taxes')); ?></td>
                        <td class="value"><?php echo e(number_format($order->tax, 2)); ?> DA</td>
                    </tr>
                    <?php endif; ?>
                    <?php if($order->shipping > 0): ?>
                    <tr>
                        <td class="label"><?php echo e(__('Frais de livraison')); ?></td>
                        <td class="value"><?php echo e(number_format($order->shipping, 2)); ?> DA</td>
                    </tr>
                    <?php endif; ?>
                    <tr class="total-row">
                        <td class="label"><?php echo e(__('TOTAL')); ?></td>
                        <td class="value"><?php echo e(number_format($order->total, 2)); ?> DA</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Notes -->
        <?php if($order->supplier_notes): ?>
        <div class="notes-section">
            <div class="notes-title"><?php echo e(__('Notes pour le fournisseur')); ?></div>
            <div class="notes-content"><?php echo e($order->supplier_notes); ?></div>
        </div>
        <?php endif; ?>

        <!-- Footer -->
        <div class="footer">
            <?php echo e(__('Document généré le')); ?> <?php echo e(now()->format('d/m/Y H:i')); ?> | 
            <?php echo e($settings['store_name'] ?? 'Quincaillerie'); ?> | 
            <?php echo e($order->po_number); ?>

        </div>
    </div>
</body>
</html>
<?php /**PATH C:\laragon\www\quincaillerie-app\resources\views/pdf/purchase-order.blade.php ENDPATH**/ ?>