<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IndicadorFinanciero extends Model
{
    use HasFactory;

    protected $table = 'indicadores_financieros';

    protected $fillable = [
        'empresa_id',
        'fecha',
        'roe',
        'roa',
        'margen_beneficio',
        'deuda_capital',
        'ingresos',
        'beneficio_neto',
        'eps'
    ];

    // Esto hace que en el JSON aparezcan los nombres unificados
    protected $appends = ['margen', 'deuda'];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    // Accessors para mapear nombres
    public function getMargenAttribute()
    {
        return $this->margen_beneficio;
    }

    public function getDeudaAttribute()
    {
        return $this->deuda_capital;
    }
}
