<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KycAudit extends Model
{
    //
    protected $table = 'kyc_audits';

    protected $fillable = [
        'user_id',
        'admin_id',
        'document_id',
        'ancien_statut',
        'nouveau_statut',
        'commentaire',
        'ip_address',
    ];
}
