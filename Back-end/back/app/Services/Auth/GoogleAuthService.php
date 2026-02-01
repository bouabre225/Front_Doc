<?php

namespace App\Services;

use App\Models\User;

class GoogleAuthService
{
    /**
     * Handle Google user authentication
     * @param object $googleUser
     * @return array
     */
    public function handleGoogleUser($googleUser): array
    {
        $user = User::updateOrCreate(
            ['email' => $googleUser->email],
            [
                'google_id' => $googleUser->id,
                'nom' => $googleUser->name,
                'email' => $googleUser->email,
                'role' => 'acheteur',
                'type_compte' => 'particulier',
            ]
        );

        return [
            'user' => $user,
            'token' => $user->createToken('google')->plainTextToken
        ];
    }
}