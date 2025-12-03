<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MovimientoSaldo extends Model
{
    protected $table = 'movimientos_saldo';
   const TIPO_INGRESO = 'ingreso';
    const TIPO_RETIRO = 'retiro';
    protected $fillable = [
        'user_id',
        'tipo',
        'monto',
        'saldo_resultante',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
