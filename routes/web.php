<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AnomalyController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\BillsController;
use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OpsStatusController;
use App\Http\Controllers\ProductsController;
use App\Http\Controllers\PurchasesController;
use App\Http\Controllers\ReplenishmentController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SuppliersController;
use App\Http\Controllers\WorkersController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
    Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('register', [RegisteredUserController::class, 'store']);
});

// Protected routes
Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/refresh', [DashboardController::class, 'refresh'])->name('dashboard.refresh');

    // Products
    Route::get('products/search', [ProductsController::class, 'search'])->name('products.search');
    Route::get('products/barcode-lookup', [ProductsController::class, 'barcodeLookup'])->name('products.barcode-lookup');
    Route::post('products/{product}/adjust-stock', [ProductsController::class, 'adjustStock'])->name('products.adjust-stock');
    Route::resource('products', ProductsController::class);

    // Categories
    Route::resource('categories', CategoriesController::class)->except(['create', 'edit', 'show']);

    // Suppliers
    Route::resource('suppliers', SuppliersController::class)->except(['create', 'edit', 'show']);

    // Workers
    Route::resource('workers', WorkersController::class);

    // Bills
    Route::get('bills/{bill}/pdf/{lang?}', [BillsController::class, 'downloadPdf'])->name('bills.pdf');
    Route::post('bills/{bill}/cancel', [BillsController::class, 'cancel'])->name('bills.cancel');
    Route::resource('bills', BillsController::class);

    // Purchase Orders
    Route::get('purchases/{purchase}/pdf/{lang?}', [PurchasesController::class, 'downloadPdf'])->name('purchases.pdf');
    Route::post('purchases/{purchase}/send', [PurchasesController::class, 'send'])->name('purchases.send');
    Route::post('purchases/{purchase}/cancel', [PurchasesController::class, 'cancel'])->name('purchases.cancel');
    Route::get('purchases/{purchase}/receive', [PurchasesController::class, 'receiveForm'])->name('purchases.receive.form');
    Route::post('purchases/{purchase}/receive', [PurchasesController::class, 'receive'])->name('purchases.receive');
    Route::resource('purchases', PurchasesController::class);

    // Replenishment / Reorder Suggestions
    Route::prefix('replenishment')->name('replenishment.')->group(function () {
        Route::get('/', [ReplenishmentController::class, 'index'])->name('index');
        Route::get('/product/{product}/forecast', [ReplenishmentController::class, 'productForecast'])->name('product.forecast');
        Route::post('/approve', [ReplenishmentController::class, 'approve'])->name('approve');
        Route::post('/dismiss', [ReplenishmentController::class, 'dismiss'])->name('dismiss');
        Route::post('/recompute', [ReplenishmentController::class, 'recompute'])->name('recompute');
        Route::get('/stats', [ReplenishmentController::class, 'stats'])->name('stats');
    });

    // Settings
    Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::put('settings', [SettingsController::class, 'update'])->name('settings.update');
    Route::post('settings/locale', [SettingsController::class, 'updateLocale'])->name('settings.locale');
    Route::post('settings/theme', [SettingsController::class, 'updateTheme'])->name('settings.theme');

    // Analytics
    Route::prefix('analytics')->name('analytics.')->group(function () {
        Route::get('/sales', [AnalyticsController::class, 'sales'])->name('sales');
        Route::get('/sales/table', [AnalyticsController::class, 'salesTable'])->name('sales.table');
        Route::get('/inventory', [AnalyticsController::class, 'inventory'])->name('inventory');
        Route::get('/export', [AnalyticsController::class, 'export'])->name('export');
        Route::post('/refresh', [AnalyticsController::class, 'refresh'])->name('refresh');
    });

    // Anomaly Findings
    Route::prefix('findings')->name('findings.')->group(function () {
        Route::get('/', [AnomalyController::class, 'index'])->name('index');
        Route::get('/stats', [AnomalyController::class, 'stats'])->name('stats');
        Route::get('/{finding}', [AnomalyController::class, 'show'])->name('show');
        Route::patch('/{finding}/status', [AnomalyController::class, 'updateStatus'])->name('update-status');
        Route::post('/bulk-update', [AnomalyController::class, 'bulkUpdate'])->name('bulk-update');
    });

    // Audit Log
    Route::prefix('audit-log')->name('audit-log.')->group(function () {
        Route::get('/', [AuditLogController::class, 'index'])->name('index');
        Route::get('/export', [AuditLogController::class, 'export'])->name('export');
        Route::get('/timeline', [AuditLogController::class, 'entityTimeline'])->name('timeline');
        Route::get('/{auditLog}', [AuditLogController::class, 'show'])->name('show');
    });

    // Notifications
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
        Route::post('/{notification}/read', [NotificationController::class, 'markAsRead'])->name('read');
        Route::post('/{notification}/unread', [NotificationController::class, 'markAsUnread'])->name('unread');
        Route::delete('/{notification}', [NotificationController::class, 'destroy'])->name('destroy');
        // API endpoints for navbar
        Route::get('/api/unread-count', [NotificationController::class, 'unreadCount'])->name('api.unread-count');
        Route::get('/api/recent', [NotificationController::class, 'recent'])->name('api.recent');
    });

    // Ops Status
    Route::prefix('ops')->name('ops.')->group(function () {
        Route::get('/status', [OpsStatusController::class, 'index'])->name('status');
        Route::post('/trigger/{jobName}', [OpsStatusController::class, 'triggerJob'])->name('trigger');
    });
});
