<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use App\Models\Commandes;
use App\Services\commandeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class commandeController extends Controller
{
    /**
     * @throws \Throwable
     */
    public function store(Request $request, commandeService $commandeService){

        $request->validate([
            'annonce_id' => 'required|exists:annonces,id',
            'quantite' => 'required|integer|min:1',
        ]);

        $commande = $commandeService->createOrder($request->user(), $request->annonce_id, $request->quantite);

        return response()->json($commande);
    }

    //methode for get all commandes
    /**
     * Lister les commandes de l'utilisateur connecté
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $commandes = Commandes::query()
            ->where(function ($query) use ($user) {
                $query->where('acheteur_id', $user->id)
                    ->orWhere('vendeur_id', $user->id);
            })
            ->with([
                'acheteur:id,nom,email',
                'vendeur:id,nom,email',
                'annonce:id,titre,prix_total,etat',
                'paiement:id,commande_id,statut,montant',
            ])
            ->when($request->statut, function ($query, $statut) {
                $query->where('statut', $statut);
            })
            ->when($request->role, function ($query, $role) use ($user) {
                if ($role === 'acheteur') {
                    $query->where('acheteur_id', $user->id);
                } elseif ($role === 'vendeur') {
                    $query->where('vendeur_id', $user->id);
                }
            })
            ->latest()
            ->paginate(20);

        return response()->json($commandes);
    }
    //methode to get an unique commande
    public function show(string $commande)
    {
        $this->authorize('view', $commande);

        return response()->json(
            $commande->load(['acheteur', 'vendeur', 'annonce', 'paiement'])
        );
    }

    //methode for delete commande
    public function deleteCommande(string $commande_id)
    {
        $commande = DB::table('commandes')
            ->where('id', $commande_id)
            ->update([
                'statut' => 'en_attente'
            ]);

        return response()->json($commande);
    }

    //methode for update a commande
    public function updateCommande(string $commande_id)
    {
       // pas de logique claire dans ma tete
        #TODO: comment on mettra la logique des mises a jours d'une commande
    }

}
