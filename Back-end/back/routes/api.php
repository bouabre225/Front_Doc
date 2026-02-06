<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\TwoFactorController;

Route::get('/', function () {
    return response()->json(['message' => 'API is running']);
});

// Auth
Route::middleware('throttle:login')->group(function () {
    Route::post('/register/acheteur', [AuthController::class, 'registerBuyer']);
    Route::post('/register/vendeur', [AuthController::class, 'registerSeller']);

    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/admin/login', [AuthController::class, 'loginAdmin']);

    // finalisation si 2FA requis (user ou admin)
    Route::post('/login/2fa', [AuthController::class, 'login2fa']);
});



// Google OAuth
Route::get('/auth/google', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

// 2FA (activation/désactivation) -> protégé
Route::middleware('auth:sanctum')->prefix('2fa')->group(function () {
    Route::post('/enable', [TwoFactorController::class, 'enable']);
    Route::post('/verify', [TwoFactorController::class, 'verify']);   // confirmation activation
    Route::post('/disable', [TwoFactorController::class, 'disable']);
});

// Logout protégé
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Exemple routes protégées rôle (quand tu voudras)
// Route::middleware(['auth:sanctum', 'role:admin'])->get('/admin/dashboard', fn() => 'Admin OK');
