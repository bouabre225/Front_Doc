<?php

namespace App\Services;

use App\Models\Annonce;
use App\Models\Commandes;
use Illuminate\Support\Facades\DB;
use Mockery\Exception;
use PhpParser\Node\Expr\Throw_;

class commandeService
{
   public function createOrder($user, int $annonce_id, int $quantite){
       return DB::transaction(function () use ($user, $annonce_id, $quantite){
           $annonce = Annonce::lockForUpdate()->findOrFail($annonce_id);

           if ($annonce->quantite < $quantite){
               throw new Exception('Le stock est insuffisant');
           }

           $montant = $annonce->prix_total * $quantite;

           $commande = Commandes::create([
               'acheteur_id' => $user->id,
               'vendeur_id' => $annonce->vendeur_id,
               'annonce_id' => $annonce_id,
               'quantite' => $quantite,
               'montant' => $montant,
               'statut' => 'en_attente',
           ]);

           $annonce->decrement('quantite', $quantite);
           return $commande;

       });
   }
}
