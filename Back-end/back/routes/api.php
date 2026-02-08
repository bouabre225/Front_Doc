<?php

use App\Http\Controllers\AnnonceController;
use App\Http\Controllers\MessageController;
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

Route::get('/annonces', [AnnonceController::class, 'index']);
Route::get('/annonces/search', [AnnonceController::class, 'search']); 
Route::get('/annonces/{annonce}', [AnnonceController::class, 'show']); 

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/annonces', [AnnonceController::class, 'store']);
    Route::put('/annonces/{annonce}', [AnnonceController::class, 'update']);
    Route::delete('/annonces/{annonce}', [AnnonceController::class, 'destroy']);
    Route::get('/messages', [MessageController::class, 'index']);
    Route::get('/messages/{userId}', [MessageController::class, 'show']);
    Route::post('/messages', [MessageController::class, 'store']);
});