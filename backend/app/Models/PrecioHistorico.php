<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrecioHistorico extends Model
{
    use HasFactory;

    protected $table = 'precios_historicos';
    protected $fillable = [
        'empresa_id',
        'fecha',
        'apertura',
        'maximo',
        'minimo',
        'cierre',
        'volumen'
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }
}
