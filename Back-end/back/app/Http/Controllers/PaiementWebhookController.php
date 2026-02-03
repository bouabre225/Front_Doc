<?php

namespace App\Http\Controllers;

use App\Models\Commandes;
use App\Models\Paiement;
use App\Services\paiementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaiementWebhookController extends Controller
{
    public function __construct(
        private paiementService $service
    ) {}

    /**
     * Initier un paiement pour une commande
     */
    public function pay(Commandes $commande)
    {
        try {
            $payment = $this->service->createPayment($commande);

            return response()->json([
                'payment_url' => $payment->provider_reference,
                'payment_id' => $payment->id,
                'montant' => $payment->montant,
                'statut' => $payment->statut,
            ]);
        } catch (\Exception $e) {
            Log::error('Payment creation failed', [
                'commande_id' => $commande->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Échec de création du paiement',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ Gérer les webhooks FedaPay
     */
    public function handleWebhook(Request $request)
    {
        // Vérifier la signature (TODO: implémenter)
        $signature = $request->header('X-FedaPay-Signature');

        Log::info('FedaPay webhook received', [
            'payload' => $request->all(),
            'signature' => $signature,
            'ip' => $request->ip(),
        ]);

        try {
            $event = $request->input('event');
            $transactionId = $request->input('transaction.id');
            $transactionAmount = $request->input('transaction.amount');

            // Trouver le paiement
            $paiement = Paiement::where('provider_reference', $transactionId)
                ->firstOrFail();

            $commande = $paiement->commande;

            // Gérer les différents événements
            switch ($event) {
                case 'transaction.approved':
                    Log::info('Payment approved', [
                        'transaction_id' => $transactionId,
                        'commande_id' => $commande->id,
                    ]);

                    // Mettre à jour le paiement
                    $paiement->update([
                        'statut' => 'bloque',
                        'date_paiement' => now(),
                    ]);

                    // Mettre à jour la commande
                    $commande->update([
                        'statut' => 'en_attente', // Attente expédition
                    ]);

                    // TODO: Envoyer notification au vendeur
                    break;

                case 'transaction.canceled':
                    Log::warning('Payment canceled', [
                        'transaction_id' => $transactionId,
                        'commande_id' => $commande->id,
                    ]);

                    $paiement->update(['statut' => 'rembourse']);
                    $commande->update(['statut' => 'annulee']);

                    // Remettre le stock
                    $commande->annonce->increment('quantite', $commande->quantite);
                    break;

                case 'transaction.failed':
                    Log::error('Payment failed', [
                        'transaction_id' => $transactionId,
                        'commande_id' => $commande->id,
                    ]);

                    // TODO: Notifier l'acheteur
                    break;

                default:
                    Log::warning('Unknown webhook event', [
                        'event' => $event,
                        'transaction_id' => $transactionId,
                    ]);
            }

            return response()->json(['status' => 'success'], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Payment not found for webhook', [
                'transaction_id' => $transactionId ?? 'unknown',
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Payment not found'], 404);

        } catch (\Exception $e) {
            Log::error('Webhook processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'Processing failed'], 500);
        }
    }
}
