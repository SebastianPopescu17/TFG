<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Notifications\CustomVerifyEmail;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'saldo',
    ];

    protected $hidden = ['password','remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'saldo' => 'decimal:2',
        ];
    }


    public function sendEmailVerificationNotification()
    {
        $this->notify(new CustomVerifyEmail);
    }


    public function watchlist()
    {
        return $this->hasMany(Watchlist::class, 'user_id');
    }


    public function alertas()
    {
        return $this->hasMany(Alerta::class, 'user_id');
    }

    public function ordenesProgramadas()
    {
        return $this->hasMany(OrdenProgramada::class, 'user_id');
    }
    public function posiciones()
{
    return $this->hasMany(Posicion::class, 'user_id');
}
}
