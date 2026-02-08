<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            'nom' => 'Admin',
            'email' => 'admin@docspace.com',
            'adresse' => 'Admin',
            'telephone' => '0000000000',
            'mot_de_passe' => bcrypt('password'),
            'role' => 'admin',
            'type_compte' => 'particulier',
            'statut' => 'actif',
            'verifie_kyc' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
