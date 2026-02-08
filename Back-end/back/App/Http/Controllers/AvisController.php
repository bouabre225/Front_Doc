<?php

namespace App\Http\Controllers;

use App\Models\Avis;
use App\Models\Annonce;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AvisController extends Controller
{
    // Afficher les avis d'une annonce (optionnel, déjà dans show de AnnonceController)
    public function index(Annonce $annonce)
    {
        $avis = $annonce->avis()->with('vendeur')->latest('created_at')->get();
        return view('avis.index', compact('annonce', 'avis'));
    }

    // Supprimer un avis (si l'utilisateur veut supprimer son propre avis)
    public function destroy(Avis $avis)
    {
        // Vérifier que l'utilisateur est bien celui qui a posté l'avis via la commande
        if ($avis->commande && $avis->commande->acheteur_id !== Auth::id()) {
            abort(403, 'Action non autorisée');
        }

        $avis->delete();

        return back()->with('success', 'Avis supprimé.');
    }
}