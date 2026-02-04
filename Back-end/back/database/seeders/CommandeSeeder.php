<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CommandeSeeder extends Seeder
{
    public function run(): void
    {
        $acheteurId = DB::table('users')->where('email', 'acheteur@docspace.com')->value('id');
        $vendeurId = DB::table('users')->where('email', 'vendeur@docspace.com')->value('id');
        $annonce = DB::table('annonces')->where('titre', 'Échographe portable Philips')->first();

        if ($annonce) {
            DB::table('commandes')->insert([
                'acheteur_id' => $acheteurId,
                'vendeur_id' => $vendeurId,
                'annonce_id' => $annonce->id,
                'quantite' => 1,
                'montant' => 5400.00,
                'created_at' => now(),
            ]);

            $commandeId = DB::getPdo()->lastInsertId();
            
            DB::statement("UPDATE commandes SET statut = 'en_attente' WHERE id = {$commandeId}");

            DB::table('paiements')->insert([
                'commande_id' => $commandeId,
                'montant' => 5400.00,
                'date_paiement' => now(),
            ]);

            $paiementId = DB::getPdo()->lastInsertId();
            DB::statement("UPDATE paiements SET moyen = 'stripe', statut = 'bloque' WHERE id = {$paiementId}");
        }
    }
}
