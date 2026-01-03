<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', \App\Livewire\HomePage::class);
Route::get('/produk/{slug}', \App\Livewire\ProductDetail::class)->name('product.detail');

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('dashboard');
    
    Route::get('/bulk-price', [\App\Http\Controllers\Admin\BulkPriceController::class, 'index'])->name('bulk-price.index');
    Route::post('/bulk-price', [\App\Http\Controllers\Admin\BulkPriceController::class, 'update'])->name('bulk-price.update');

    Route::resource('banners', \App\Http\Controllers\Admin\BannerController::class)->except(['edit', 'update', 'show']);
    Route::resource('products', \App\Http\Controllers\Admin\ProductController::class);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Cart Routes
    Route::get('/cart', [\App\Http\Controllers\CartController::class, 'index'])->name('cart.index');
    Route::post('/cart', [\App\Http\Controllers\CartController::class, 'add'])->name('cart.add');
    Route::patch('/cart/{id}', [\App\Http\Controllers\CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{id}', [\App\Http\Controllers\CartController::class, 'remove'])->name('cart.remove');
    
    // Checkout Routes (Placeholder for next step)
    Route::get('/checkout', [\App\Http\Controllers\CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout', [\App\Http\Controllers\CheckoutController::class, 'store'])->name('checkout.store');
    
    // Order Routes
    Route::get('/dashboard', [\App\Http\Controllers\OrderController::class, 'index'])->name('dashboard');
    Route::get('/orders', [\App\Http\Controllers\OrderController::class, 'index'])->name('order.index');
    Route::get('/orders/{id}', [\App\Http\Controllers\OrderController::class, 'show'])->name('order.show');
});

require __DIR__.'/auth.php';
