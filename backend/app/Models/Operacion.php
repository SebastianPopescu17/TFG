<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Operacion extends Model
{
    const TIPO_COMPRA = 'compra';
    const TIPO_VENTA = 'venta';
    protected $table = 'operaciones';
    protected $fillable = [
    'user_id',
    'empresa_id',
    'tipo',
    'cantidad',
    'precio',
    'plusvalia',
];


    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function user() { return $this->belongsTo(User::class); }
}
