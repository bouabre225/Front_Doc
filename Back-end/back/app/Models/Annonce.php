<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;

class Annonce extends Model
{
    use HasUuid;
    

    protected $fillable = [
        'seller_id',
        'category_id',
        'title',
        'description',
        'price',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function commandeItems()
    {
        return $this->hasMany(CommandeItem::class);
    }
}
