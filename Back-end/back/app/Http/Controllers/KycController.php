<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\KycSubmitRequest;
use App\Services\Auth\KycService;
use App\Models\KycDocument;

class KycController extends Controller
{
    /**
     * POST /kyc/submit
     * Vendeur soumet ou remplace son document KYC.
     */
    public function submit(KycSubmitRequest $request, KycService $service)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        if ($user->role !== 'vendeur') {
            return response()->json(['message' => 'Réservé aux vendeurs.'], 403);
        }

        $doc = $service->submit($user, $request->validated());

        return response()->json([
            'message' => 'Document KYC soumis. En attente de validation.',
            'kyc' => $doc,
        ], 200);
    }

     /**
     * GET /kyc/status
     * Voir le statut KYC
     */
    public function status(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        if ($user->role !== 'vendeur') {
            return response()->json(['message' => 'Réservé aux vendeurs.'], 403);
        }

        $doc = KycDocument::where('user_id', $user->id)->first();

        return response()->json([
            'verifie_kyc' => (bool) $user->verifie_kyc,
            'kyc_document' => $doc,
        ], 200);
    }
}
