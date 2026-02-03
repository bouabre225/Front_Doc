<?php

use App\Http\Controllers\commandeController;
use App\Http\Controllers\KycController;
use App\Http\Controllers\PaiementWebhookController;
use App\Http\Controllers\admin\adminController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('kyc')->group(function () {
    Route::get('/documents', [KycController::class, 'index']);
    Route::post('/documents', [KycController::class, 'store']);
    Route::delete('/documents/{id}', [KycController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->prefix('admin/kyc')->group(function () {
    Route::get('/pending', [adminController::class, 'pending']);
    Route::post('/documents/{document}/validate', [adminController::class, 'validateKyc']);
});

Route::middleware('auth:sanctum')->prefix('commandes')->group(function () {
    Route::get('/', [commandeController::class, 'index']);
    Route::post('/', [commandeController::class, 'store']);
    Route::get('/{commande}', [commandeController::class, 'show']);
    Route::post('/{commande}/cancel', [commandeController::class, 'cancel']);
    Route::post('/{commande}/pay', [PaiementWebhookController::class, 'pay']);
});

Route::post('/webhooks/fedapay', [PaiementWebhookController::class, 'handleWebhook'])
    ->name('fedapay.webhook');
