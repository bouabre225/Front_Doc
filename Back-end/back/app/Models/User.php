<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use App\Models\Concerns\HasUuid;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, HasUuid;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'email',
        'password',
        'first_name',
        'last_name',
        'email_verified_at',
        'disabled_at',
        'two_factor_secret',
        'two_factor_enabled_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'disabled_at' => 'datetime',
            'two_factor_enabled_at' => 'datetime',
        ];
    }

    public function kycDocuments()
    {
        return $this->hasMany(KycDocument::class);
    }

    public function annonces()
    {
        return $this->hasMany(Annonce::class, 'seller_id');
    }

    public function commandes()
    {
        return $this->hasMany(Commande::class, 'buyer_id');
    }

    public function avisDonnes()
    {
        return $this->hasMany(Avis::class, 'reviewer_id');
    }

    public function avisRecus()
    {
        return $this->hasMany(Avis::class, 'seller_id');
    }

    public function messagesEnvoyes()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function messagesRecus()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }
}
