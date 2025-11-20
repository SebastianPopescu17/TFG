<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alerta extends Model
{
    use HasFactory;

    protected $table = 'alertas';

    protected $fillable = [
        'user_id',
        'empresa_id',
        'tipo',
        'condicion',
        'valor',
        'activa',
        'fecha_cumplida'
    ];

    
    protected $casts = [
        'valor' => 'array',
        'activa' => 'boolean',
        'fecha_cumplida' => 'datetime',
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
