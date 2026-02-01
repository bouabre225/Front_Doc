<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * Register a new user
     */
    public function register(array $data) : User
    {
        //renvoi l'utilisateur créé
        return User::create([
            'nom' => $data['nom'],
            'email' => $data['email'],
            'mot_de_passe' => $data['password'],
            'role' => 'acheteur',
            'type_compte' => 'particulier',
        ]);
    }

    /**
     * Login a user
     */
    public function login(string $email, string $password): array
    {
        //récupère l'utilisateur
        $user = User::where('email', $email)->firstOrFail();

        //vérifie le mot de passe
        if (!Hash::check($password, $user->mot_de_passe)) {
            throw new \Exception('Identifiants invalides');
        }

        //vérifie le statut
        if ($user->statut !== 'actif') {
            throw new \Exception('Compte suspendu');
        }

        //retourne l'utilisateur et le token
        return [
            'user' => $user,
            'token' => $user->createToken('auth_token')->plainTextToken
        ];
    }
}