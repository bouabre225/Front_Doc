<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Litige extends Model
{
    protected $fillable = [
        'commande_id',
        'acheteur_id',
        'motif',
        'preuves',
        'statut'
    ];

    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }

    public function acheteur()
    {
        return $this->belongsTo(User::class, 'acheteur_id');
    }
}
