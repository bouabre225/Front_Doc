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
        'google_id',
        'avatar',
        'role',
        'type_compte',
        'nom',
        'email',
        'mot_de_passe',
        'telephone',
        'pays',
        'devise',
        'adresse',
        'two_factor_secret',
        'verifie_kyc',
        'badge_verifie',
        'note_moyenne',
        'statut'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'mot_de_passe',
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
            'verifie_kyc' => 'boolean',
            'badge_verifie' => 'boolean',
            'note_moyenne' => 'decimal:1',
        ];
    }

    public function setMotDePasseAttribute($value)
    {
        $this->attributes['mot_de_passe'] = bcrypt($value);
    }
    
    public function kycDocuments()
    {
        return $this->hasMany(KycDocument::class);
    }

    public function annonces()
    {
        return $this->hasMany(Annonce::class, 'vendeur_id');
    }

    public function commandesAcheteur()
    {
        return $this->hasMany(Commande::class, 'acheteur_id');
    }

    public function commandesVendeur()
    {
        return $this->hasMany(Commande::class, 'vendeur_id');
    }

    public function messagesEnvoyes()
    {
        return $this->hasMany(Message::class, 'expediteur_id');
    }

    public function messagesRecus()
    {
        return $this->hasMany(Message::class, 'recepteur_id');
    }

    
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
