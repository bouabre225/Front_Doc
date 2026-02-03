<?php

use App\Http\Controllers\annonceController;
use App\Http\Controllers\commandeController;
use App\Http\Controllers\KycController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/kyc/document', [KycController::class, 'index']);
    Route::post('/kyc/document/{id}', [KycController::class, 'store']);
    Route::delete('/admin/kyc/document/', [KycController::class, 'allDocument']);
    Route::get('admin/kyc/pending', [\App\Http\Controllers\admin\adminController::class, 'pending']);
    Route::post('kyc/submit', [\App\Http\Controllers\KycController::class, 'submit']);
    Route::post('admin/kyc/{document}/validate', [\App\Http\Controllers\admin\adminController::class, 'validateKyc']);
});

//route pour gerer les commandes

Route::middleware('auth:sanctum')->group(function (){
    Route::post('/commandes', [commandeController::class, 'store']);
    Route::get('/commandes', [commandeController::class, 'index']);
    Route::get('/commandes/{commande}', [commandeController::class, 'show']);
    Route::delete('/commandes/{commande_id}', [commandeController::class, 'deleteCommande']);
    Route::put('/commandes/{commande_id}', [commandeController::class, 'updateCommande']);
    Route::post('/commandes/{commande_id}/ship', [commandeController::class, 'shipCommande']);
    Route::post('/commandes/{commande_id}/deliver', [commandeController::class, 'deliverCommande']);
    Route::post('/commandes/{commande_id}/close', [commandeController::class, 'closeCommande']);
    Route::post('/commandes/{commande_id}/cancel', [commandeController::class, 'cancelCommande']);
});
//route de fedapay
Route::post('/webhooks/fedapay', [\App\Http\Controllers\PaiementWebhookController::class, 'handleWebhook'])
->name('fedapay.webhook');

Route::middleware('auth:sanctum')->group(function () {
    // Initier un paiement
    Route::post('/commandes/{commande}/pay', [PaiementWebhookController::class, 'pay']);
});

//route pour gerer le cycle de vie des commandes
#Todo : A revoir la logique et les routes
Route::middleware('auth:sanctum')->group(function () {
   Route::put('/commandes/{commande_id}/validate', [\App\Http\Controllers\admin\adminController::class, 'validateCommande']);
});
