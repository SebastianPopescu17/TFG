<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Noticia extends Model
{
    use HasFactory;

    protected $table = 'noticias';

    protected $fillable = [
        'empresa_id',
        'titulo',
        'enlace',
        'fuente',
        'fecha_publicacion'
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }
}
