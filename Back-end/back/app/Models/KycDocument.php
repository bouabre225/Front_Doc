<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasUuid;

class KycDocument extends Model
{
    use HasUuid;
    
    protected $fillable = [
        'user_id',
        'document_type',
        'document_url',
        'status',
        'submitted_at',
        'validated_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'validated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
