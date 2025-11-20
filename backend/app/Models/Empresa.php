<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\PrecioHistorico;
use App\Models\IndicadorFinanciero;
use App\Models\Noticia;
use App\Models\Watchlist;
use App\Models\Alerta;
use App\Models\Tick;
use App\Models\Operacion;
use App\Models\Posicion;

class Empresa extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticker',
        'nombre',
        'sector',
        'industria',
        'pais',
        'capitalizacion',
        'per',
        'dividendo',
        'precio_actual',
        'moneda',
        'sitio_web',
        'descripcion'
    ];

    // Relación: una empresa tiene muchos precios históricos
    public function preciosHistoricos()
    {
        return $this->hasMany(PrecioHistorico::class);
    }

    // Relación: una empresa tiene muchos indicadores financieros
    public function indicadoresFinancieros()
    {
        return $this->hasMany(IndicadorFinanciero::class);
    }

    // Relación: una empresa puede estar en muchas watchlists
    public function watchlists()
    {
        return $this->hasMany(Watchlist::class);
    }

    // Relación: una empresa puede tener muchas alertas
    public function alertas()
    {
        return $this->hasMany(Alerta::class);
    }

public function ticks()
{
    return $this->hasMany(Tick::class);
}
public function operaciones()
{
    return $this->hasMany(Operacion::class);
}
public function posiciones()
{
    return $this->hasMany(Posicion::class);
}

}
