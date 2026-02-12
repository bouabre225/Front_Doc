<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Annonce extends Model
{
    use HasFactory;

    public $timestamps = false;
    const CREATED_AT = 'created_at';

    protected $fillable = [
        'vendeur_id', 'titre', 'description', 'categorie',
        'etat', 'prix_vendeur', 'quantite', 'pays_expedition', 'statut'
    ];

    protected $casts = [
        'prix_vendeur' => 'decimal:2',
        'frais_protection' => 'decimal:2',
        'prix_total' => 'decimal:2',
        'quantite' => 'integer'
    ];

    public function vendeur()
    {
        return $this->belongsTo(User::class, 'vendeur_id');
    }

    public function user()
    {
        return $this->vendeur();
    }

    public function avis()
    {
        return $this->hasMany(Avis::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function images()
    {
        return $this->hasMany(AnnonceImage::class);
    }

    public function noteMoyenne()
    {
        $avis = $this->avis;
        if ($avis->count() === 0) return 0;
        
        $totalNoteVendeur = $avis->sum('note_vendeur');
        $totalNoteConformite = $avis->sum('note_conformite');
        $count = $avis->count();
        
        return round((($totalNoteVendeur + $totalNoteConformite) / 2) / $count, 1);
    }
}
