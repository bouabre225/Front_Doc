<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Str;

class GoogleAuthService
{
    /**
     * Handle Google user authentication
     * @param object $googleUser
     * @return array
     */
    public function handleGoogleUser($googleUser): array
    {
        $user = User::where('email', $googleUser->email)->first();

        if (!$user) {
            $user = User::create([
                'google_id' => $googleUser->id,
                'nom' => $googleUser->name,
                'email' => $googleUser->email,
                'role' => 'acheteur',
                'type_compte' => 'particulier',
                'mot_de_passe' => Str::random(32),
            ]);
        } else {
            // optionnel : juste lier google_id si pas déjà lié
            if (!$user->google_id) {
                $user->google_id = $googleUser->id;
                $user->save();
            }
        }


        return [
            'user' => $user,
            'token' => $user->createToken('google')->plainTextToken
        ];
    }
}