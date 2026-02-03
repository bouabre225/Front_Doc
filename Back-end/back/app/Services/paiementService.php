<?php

namespace App\Services;

use App\Models\Commandes;
use App\Models\Paiement;
use App\Services\Paiement\FedaPayGateway;
use Illuminate\Support\Facades\DB;

class paiementService
{
    public function __construct(
        private FedaPayGateway $gateway
    ) {}

    public function createPayment(Commandes $commande)
    {
        return DB::transaction(function () use ($commande) {

            $response = $this->gateway->createTransaction([
                'amount' => $commande->montant,
                'currency' => 'XOF',
                'description' => 'Commande #'.$commande->id,
                'callback_url' => route('fedapay.webhook'),
                'metadata' => [
                    'order_id' => $commande->id,
                ]
            ]);

            return Paiement::create([
                'commande_id' => $commande->id,
                'moyen' => 'fedapay',
                'montant' => $commande->montant,
                'statut' => 'bloque',
                'provider_reference' => $response['id']
            ]);
        });
    }
    public function markAsPaid(Commandes $commande, string $provider, float $montant){
        return DB::transaction(function () use ($commande, $provider, $montant){
            if ($commande->paiement){
                return $commande->paiement;
            }
            $paiement = Paiement::create([
                'commande_id' => $commande->id,
                'moyen' => $provider,
                'montant' => $montant,
                'statut' => 'bloque',
                'date_paiement' => now(),
            ]);

            $commande->update([
                'statut' => 'libere',
            ]);

            return $paiement;
        });
    }
}
