<?php

namespace App\Services;

use App\Models\KycDocument;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class KycService
{
    public function submitDocument(User $user, array $data)
    {
        return DB::transaction(function () use ($user, $data){
           return KycDocument::create([
               'user_id' => $user->id,
               'type_documents' => $data['type_documents'],
               'fichier' => $data['fichier'],
               'statut' => 'en_attente',
           ]);
        });
    }

    public function validateDocument(KycDocument $document, User $admin,string $decision,?string $commentaire, string $ip_address){
        return DB::transaction(function () use ($document, $admin, $decision, $commentaire, $ip_address){
            $ancienStatut = $document->statut;
            $document->update([
                'statut' => $decision,
                'date_validation' => now(),
            ]);

            if ($decision === 'valide'){
                User::where('id', $document->user_id)
                ->update(['verifie_kyc' => true]);
            }
            return true;
        });
    }
}
