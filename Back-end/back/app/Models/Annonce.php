<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;

class Annonce extends Model
{
    use HasUuid;
    

    protected $fillable = [
        'vendeur_id',
        'titre',
        'description',
        'categorie',
        'etat',
        'prix_vendeur',
        'quantite',
        'pays_expedition',
        'statut'
    ];

    protected $casts = [
        'prix_vendeur' => 'decimal:2',
    ];

    public function vendeur()
    {
        return $this->belongsTo(User::class, 'vendeur_id');
    }

    public function images()
    {
        return $this->hasMany(AnnonceImage::class);
    }

    public function commandes()
    {
        return $this->hasMany(Commande::class);
    }
}
