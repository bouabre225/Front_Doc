<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * Register a new user
     */
    public function registerBuyer(array $data) : User
    {
        //vérifie si l'email est déjà utilisé
        if (User::where('email', $data['email'])->exists()) {
            throw new \Exception('Email already used');
        }


        //renvoi l'utilisateur créé
        return User::create([
            'nom' => $data['nom'],
            'email' => $data['email'],
            'mot_de_passe' => $data['password'],
            'telephone' => $data['telephone'],
            'adresse' => $data['adresse'],
            'role' => 'acheteur',
            'statut' => 'actif',
            'type_compte' => 'particulier',
        ]);
    }

    /**
     * Register a new seller
     */
    public function registerSeller(array $data) : User
    {
          //vérifie si l'email est déjà utilisé
        if (User::where('email', $data['email'])->exists()) {
            throw new \Exception('Email already used');
        }

        //renvoi l'utilisateur créé
        return User::create([
            'nom' => $data['nom'],
            'email' => $data['email'],
            'mot_de_passe' => $data['password'],
            'telephone' => $data['telephone'],
            'adresse' => $data['adresse'],
            'role' => 'vendeur',
            'statut' => 'suspendu',
            'type_compte' => 'professionnel',
        ]);
    }


    /**
     * Login Admin
     */
    public function loginAdmin(string $email, string $password): array
    {
        //récupere l'utilisateur avec le role admin 
        $user = User::where('email', $email)->where('role', 'admin')->firstOrFail();
        
        //verifie le mot de passe 
        if (!Hash::check($password, $user->password)) throw new \Exception('Identifiants invalides');

        //verifier le role
        if($user->role !== 'admin') throw new \Exception('Compte pas autorisé');

        //génerer le token de connexion
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token
        ];
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

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }


}