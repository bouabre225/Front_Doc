<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\ServiceProvider;

class KycProvider extends ServiceProvider
{
    /**
     * @throws ConnectionException
     */
    public function verificationKYC(User $user){
        $response = Http::withToken(config('services.kyc.token'))
            ->post(config('services.kyc.url'), '/verifications', [
                'external_id' => $user->id,
                'email' => $user->email
            ]);
        return $response->json();
    }
}
