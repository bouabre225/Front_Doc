<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commandes extends Model
{
    protected $table = 'commandes';
    protected $fillable = [
        'acheteur_id',
        'vendeur_id',
        'annonce_id',
        'quantite',
        'montant',
        'statut',
    ];
}
