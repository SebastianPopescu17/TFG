<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrdenProgramada extends Model
{
    use HasFactory;

    protected $table = 'ordenes_programadas';

    protected $fillable = [
        'user_id',
        'empresa_id',
        'tipo',
        'cantidad',
        'precio_objetivo',
        'estado',
        'scheduled_at',
        'cantidad_ejecutada',
        'motivo_cancelacion'
    ];

    protected $casts = [
        'precio_objetivo' => 'decimal:2',
        'scheduled_at' => 'datetime',
        'cantidad' => 'decimal:2',
        'cantidad_ejecutada' => 'decimal:2',
    ];

   
    const TIPO_COMPRA = 'compra';
    const TIPO_VENTA = 'venta';

    const ESTADO_PENDIENTE = 'pendiente';
    const ESTADO_CANCELADA = 'cancelada';
    const ESTADO_CUMPLIDA = 'cumplida';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function scopePendientes($query)
    {
        return $query->where('estado', self::ESTADO_PENDIENTE);
    }


    public function setEstadoAttribute($value)
    {
        $this->attributes['estado'] = strtolower(trim($value));
    }


    public function getEstadoAttribute($value)
    {
        return strtolower(trim($value));
    }
}
