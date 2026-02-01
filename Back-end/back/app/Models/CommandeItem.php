<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;

class CommandeItem extends Model
{
    use HasUuid;
    

    protected $fillable = [
        'commande_id',
        'annonce_id',
        'price',
        'quantity',
    ];

    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }

    public function annonce()
    {
        return $this->belongsTo(Annonce::class);
    }
}
