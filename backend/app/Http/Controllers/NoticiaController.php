<?php

namespace App\Http\Controllers;

use App\Models\Noticia;

class NoticiaController extends Controller
{
    public function index()
    {
        return Noticia::with('empresa')->orderBy('fecha_publicacion','desc')->get();
    }
}
