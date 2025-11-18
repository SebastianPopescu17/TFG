<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Posicion extends Model
{
    protected $table = 'posiciones';
    protected $fillable = ['user_id','empresa_id','cantidad','invertido','precio_medio'];

    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function user() { return $this->belongsTo(User::class); }
}
