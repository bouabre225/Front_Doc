<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Annonce;

class AnnonceController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        // Ici le middleware 'role:vendeur' + 'kyc' fera déjà le boulot.
        $data = $request->validate([
            'titre' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'categorie' => ['nullable', 'string', 'max:100'],
            'etat' => ['nullable', 'in:neuf,tres_bon,bon,acceptable'],
            'prix_vendeur' => ['required', 'numeric', 'min:0'],
            'quantite' => ['nullable', 'integer', 'min:1'],
            'pays_expedition' => ['nullable', 'string', 'max:50'],
        ]);

        $annonce = Annonce::create([
            'vendeur_id' => $user->id,
            'titre' => $data['titre'],
            'description' => $data['description'] ?? null,
            'categorie' => $data['categorie'] ?? null,
            'etat' => $data['etat'] ?? null,
            'prix_vendeur' => $data['prix_vendeur'],
            'quantite' => $data['quantite'] ?? 1,
            'pays_expedition' => $data['pays_expedition'] ?? null,
            'statut' => 'active',
        ]);

        return response()->json([
            'message' => 'Annonce créée',
            'annonce' => $annonce,
        ], 201);
    }
}

