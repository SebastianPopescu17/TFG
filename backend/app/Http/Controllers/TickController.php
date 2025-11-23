<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use Illuminate\Http\Request;

class TickController extends Controller
{
    public function ultimos(Empresa $empresa)
    {
        // últimos 50 ticks ordenados por fecha
        $ticks = $empresa->ticks()
            ->orderByDesc('registrado_en')
            ->get()
            ->reverse()
            ->values();

        return response()->json($ticks);
    }
}
