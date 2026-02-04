<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\EnableTwoFactorRequest;
use App\Http\Requests\VerifyTwoFactorRequest;
use App\Services\Auth\TwoFactorService;

class TwoFactorController extends Controller
{
    /**
     * Activer le 2FA pour l'utilisateur
     */
    public function enable(EnableTwoFactorRequest $request, TwoFactorService $service) {
        $user = $request->user();

        $secret = $service->enable($user);

        return response()->json([
            'message' => '2FA activé',
            'secret' => $secret, // à afficher en QR côté front
        ]);
    }

    /**
     * Vérifier le code 2FA
     */
    public function verify(VerifyTwoFactorRequest $request, TwoFactorService $service) {
        $user = $request->user();

        $isValid = $service->verify($user, $request->code);

        if (!$isValid) {
            return response()->json([
                'message' => 'Code 2FA invalide'
            ], 422);
        }

        return response()->json([
            'message' => '2FA vérifié avec succès'
        ]);
    }

    /**
     * Désactiver le 2FA pour l'utilisateur
     */
    public function disable(Request $request)
    {
        $request->user()->update([
            'two_factor_secret' => null,
        ]);

        return response()->json([
            'message' => '2FA désactivé'
        ]);
    }
}
