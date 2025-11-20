<?php

namespace App\Http\Controllers;

use App\Models\PrecioHistorico;
use Illuminate\Http\Request;

class PrecioHistoricoController extends Controller
{
    public function index($id, Request $request)
{
    $empresaId = (int) $id;
    $query = PrecioHistorico::where('empresa_id', $empresaId);

    if ($request->has('desde')) {
        $query->where('fecha', '>=', $request->input('desde'));
    }

    if ($request->has('hasta')) {
        $query->where('fecha', '<=', $request->input('hasta'));
    }

    $precios = $query->orderBy('fecha', 'asc')->get();
    return response()->json($precios);
}

}
