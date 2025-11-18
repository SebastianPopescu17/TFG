<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Empresa;
use App\Models\Noticia;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    /**
     * Devuelve estadísticas básicas para el panel admin.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'usuarios_totales' => User::count(),
            'usuarios_admin'   => User::where('role', 'admin')->count(),
            'empresas'         => Empresa::count(),
            'noticias'         => Noticia::count(),
            'ultimo_usuario'   => User::latest()->first()?->only(['id','name','email','role']),
        ]);
    }
}
