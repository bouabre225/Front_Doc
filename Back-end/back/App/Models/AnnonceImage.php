<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;

class AnnonceImage extends Model
{
    use HasUuid;
    
    protected $fillable = [
        'annonce_id',
        'image_url',
        'ordre'
    ];

    public function annonce()
    {
        return $this->belongsTo(Annonce::class);
    }
}
