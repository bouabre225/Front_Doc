<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;

class Avis extends Model
{
    use HasUuid;
    
    protected $fillable = [
        'commande_id',
        'vendeur_id',
        'note_vendeur',
        'note_conformite',
        'commentaire'
    ];

    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }

    public function vendeur()
    {
        return $this->belongsTo(User::class, 'vendeur_id');
    }
}
