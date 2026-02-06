<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;

class Paiement extends Model
{
    use HasUuid;
    

    protected $fillable = [
        'commande_id',
        'moyen',
        'montant',
        'statut',
        'date_paiement'
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'date_paiement' => 'datetime',
    ];

    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }
}
