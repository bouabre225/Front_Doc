<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KycDocument extends Model
{
    protected $table = 'kyc_documents';
    protected $fillable = [
        'user_id',
        'type_documents',
        'fichier',
        'statut',
    ];

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::Class);
    }
}
