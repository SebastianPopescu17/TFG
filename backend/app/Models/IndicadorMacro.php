<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IndicadorMacro extends Model
{
    use HasFactory;

    protected $table = 'indicadores_macro';

    protected $fillable = [
        'pais',
        'codigo',
        'nombre',
        'valor',
        'valor_usd',
        'valor_eur',
        'unidad',
        'fecha',
        'anio',
        'variacion',
    ];

    // Scopes de conveniencia
    public function scopeDesde2000($query)
    {
        return $query->where('anio', '>=', 2000);
    }

    public function scopePais($query, string $iso3)
    {
        return $query->where('pais', strtoupper($iso3));
    }

    public function scopeCodigo($query, string $code)
    {
        return $query->where('codigo', strtoupper($code));
    }
}
