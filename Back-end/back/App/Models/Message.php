<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;

class Message extends Model
{
    use HasUuid;
    
    protected $fillable = [
        'expediteur_id',
        'recepteur_id',
        'annonce_id',
        'contenu',
        'lu'
    ];

    protected $casts = [
        'lu' => 'boolean',
    ];

    public function expediteur()
    {
        return $this->belongsTo(User::class, 'expediteur_id');
    }

    public function recepteur()
    {
        return $this->belongsTo(User::class, 'recepteur_id');
    }

    public function annonce()
    {
        return $this->belongsTo(Annonce::class);
    }
}
