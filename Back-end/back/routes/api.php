<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('kyc/submit', [\App\Http\Controllers\KycController::class, 'submit']);
    Route::post('admin/kyc/{document}/validate', [\App\Http\Controllers\admin\adminController::class, 'validateKyc']);
});
