<?php

namespace App\Services\Auth;

use App\Models\User;

class TwoFactorService
{
    /**
     * Enable two-factor authentication for a user
     */
    public function enable(User $user): string
    {
        $secret = app('pragmarx.google2fa')->generateSecretKey();
        $user->update(['two_factor_secret' => $secret]);
        return $secret;
    }

    /**
     * Verify two-factor authentication code
     */
    public function verify(User $user, string $code): bool
    {
        return app('pragmarx.google2fa')
            ->verifyKey($user->two_factor_secret, $code);
    }
}