<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use Illuminate\Http\Request;

class EmpresaController extends Controller
{
    // Listado de empresas con filtros, búsqueda y paginación
    public function index(Request $request)
    {
        $query = Empresa::select('id','ticker','nombre','sector','pais','precio_actual');

        if ($request->filled('sector')) {
            $query->where('sector', $request->sector);
        }

        if ($request->filled('pais')) {
            $query->where('pais', $request->pais);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('ticker', 'like', "%{$search}%");
            });
        }

        if ($request->filled('sort')) {
            $sort = $request->sort;
            $direction = $request->direction === 'desc' ? 'desc' : 'asc';
            $sortable = ['capitalizacion','precio_actual','nombre'];
            if (in_array($sort, $sortable)) {
                $query->orderBy($sort, $direction);
            }
        } else {
            $query->orderBy('nombre', 'asc');
        }

        //Paginación (100 por defecto)
        $empresas = $query->paginate($request->get('per_page', 80));

        return response()->json($empresas);
    }

    // Detalle de empresa
    public function show($ticker)
    {
        $ticker = strtoupper($ticker);
        return Empresa::where('ticker', $ticker)
            ->with([
                'preciosHistoricos' => fn($q) => $q->orderBy('fecha', 'desc')->limit(180),
                'indicadoresFinancieros' => fn($q) => $q->orderBy('fecha', 'desc')->limit(8),
            ])
            ->firstOrFail();
    }

    // Histórico de precios
    public function historico($ticker)
    {
        $empresa = Empresa::where('ticker', strtoupper($ticker))->firstOrFail();
        return $empresa->preciosHistoricos()->orderBy('fecha','desc')->get();
    }

    // Datos para gráfica
    public function grafica($ticker)
    {
        $empresa = Empresa::where('ticker', strtoupper($ticker))->firstOrFail();
        $historico = $empresa->preciosHistoricos()->orderBy('fecha','asc')->get(['fecha','cierre']);
        return response()->json([
            'empresa' => $empresa->nombre,
            'ticker' => $empresa->ticker,
            'datos' => $historico
        ]);
    }

    // Últimos ticks
    public function ticks($ticker)
    {
        $empresa = Empresa::where('ticker', strtoupper($ticker))->firstOrFail();
        $ticks = $empresa->ticks()->orderBy('registrado_en','desc')->limit(50)->get()->reverse()->values();
        return response()->json($ticks);
    }

    // Indicadores
    public function indicadores($id)
{
    $empresa = Empresa::findOrFail($id);
    return $empresa->indicadoresFinancieros()->orderBy('fecha','desc')->limit(8)->get();
}

}
