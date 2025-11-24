<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tick extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'empresa_id',
        'apertura',
        'maximo',
        'minimo',
        'cierre',
        'registrado_en',
    ];


    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }
}
