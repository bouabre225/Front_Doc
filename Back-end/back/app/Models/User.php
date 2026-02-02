<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    public mixed $email;
    public mixed $id;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nom',
        'email',
        'password',
        'kycReference',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
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
        ];
    }

    public function kycDocuments(){
        return $this->hasMany($this->KycDocument::Class);
    }

    public function commandesAcheteur(){
        return $this->hasMany(Commandes::Class, 'acheteur_id');
    }

    public function commandeVendeurs(){
        return $this->hasMany(Commandes::Class, 'vendeur_id');
    }

    public function hasValidKyc(): bool
    {
        return $this->verifie_kyc === true;
    }
}
