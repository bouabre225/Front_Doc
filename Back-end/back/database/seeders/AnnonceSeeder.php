<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AnnonceSeeder extends Seeder
{
    public function run(): void
    {
        $vendeurId = DB::table('users')->where('email', 'vendeur@docspace.com')->value('id');

        DB::table('annonces')->insert([
            [
                'id' => Str::uuid(),
                'vendeur_id' => $vendeurId,
                'titre' => 'Échographe portable Philips',
                'description' => 'Échographe portable en excellent état, peu utilisé. Idéal pour cabinet médical.',
                'categorie' => 'Imagerie médicale',
                'prix_vendeur' => 5000.00,
                'quantite' => 1,
                'pays_expedition' => 'France',
                'etat' => 'tres_bon',
                'statut' => 'active',
                'created_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'vendeur_id' => $vendeurId,
                'titre' => 'Tensiomètre automatique',
                'description' => 'Lot de 5 tensiomètres automatiques neufs.',
                'categorie' => 'Instruments de mesure',
                'prix_vendeur' => 250.00,
                'quantite' => 5,
                'pays_expedition' => 'France',
                'etat' => 'tres_bon',
                'statut' => 'active',
                'created_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'vendeur_id' => $vendeurId,
                'titre' => 'Table d\'examen médical',
                'description' => 'Table d\'examen ajustable en hauteur, très bon état.',
                'categorie' => 'Mobilier médical',
                'prix_vendeur' => 800.00,
                'quantite' => 2,
                'pays_expedition' => 'France',
                'etat' => 'tres_bon',
                'statut' => 'active',
                'created_at' => now(),
            ],
        ]);
    }
}
