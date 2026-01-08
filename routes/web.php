<?php

use App\Http\Controllers\BillsController;
use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductsController;
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

    // Products
    Route::get('products/search', [ProductsController::class, 'search'])->name('products.search');
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

    // Settings
    Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::put('settings', [SettingsController::class, 'update'])->name('settings.update');
    Route::post('settings/locale', [SettingsController::class, 'updateLocale'])->name('settings.locale');
    Route::post('settings/theme', [SettingsController::class, 'updateTheme'])->name('settings.theme');
});
