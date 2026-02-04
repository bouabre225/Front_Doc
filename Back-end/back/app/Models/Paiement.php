<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    protected $table = 'paiements';

    protected $fillable = [
        'commande_id',
        'montant',
        'moyen',
        'statut',
        'date_paiement',
        'provider_reference',
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'date_paiement' => 'datetime',
    ];

    public $timestamps = false;

    public function commande()
    {
        return $this->belongsTo(Commandes::class, 'commande_id');
    }
}
