<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use Illuminate\Http\Request;
use App\Models\Tick;

class EmpresaController extends Controller
{
    //Listado de empresas con filtros, búsqueda y paginación
    public function index(Request $request)
    {
        $query = Empresa::select('id','ticker','nombre','sector','pais','precio_actual');

        //Filtro por sector
        if ($request->has('sector')) {
            $query->where('sector', $request->sector);
        }

        //Filtro por país
        if ($request->has('pais')) {
            $query->where('pais', $request->pais);
        }

        //Búsqueda por nombre o ticker
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre', 'like', "%$search%")
                  ->orWhere('ticker', 'like', "%$search%");
            });
        }

        //Ordenar por capitalización, precio o nombre
        if ($request->has('sort')) {
            $sort = $request->sort;
            $direction = $request->get('direction', 'asc');
            if (in_array($sort, ['capitalizacion','precio_actual','nombre'])) {
                $query->orderBy($sort, $direction);
            }
        } else {
            $query->orderBy('nombre', 'asc');
        }

        //Paginación (100 por defecto)
        $empresas = $query->paginate($request->get('per_page', 60));

        return response()->json($empresas);
    }

    //Detalle de empresa con históricos, indicadores y noticias
    public function show($ticker)
    {
        return Empresa::where('ticker', strtoupper($ticker))
            ->with([
                'preciosHistoricos' => fn($q) => $q->orderBy('fecha', 'desc')->limit(180),
                'indicadoresFinancieros' => fn($q) => $q->orderBy('fecha', 'desc')->limit(8),
                'noticias' => fn($q) => $q->orderBy('fecha_publicacion', 'desc')->limit(5)
            ])
            ->firstOrFail();
    }

    //Solo histórico de precios
    public function historico($ticker)
    {
        $empresa = Empresa::where('ticker', strtoupper($ticker))->firstOrFail();
        return $empresa->preciosHistoricos()->orderBy('fecha', 'desc')->get();
    }

    //Datos para gráfica de la empresa
    public function grafica($ticker)
    {
        $empresa = Empresa::where('ticker', strtoupper($ticker))->firstOrFail();

        $historico = $empresa->preciosHistoricos()
            ->orderBy('fecha', 'asc')
            ->get(['fecha', 'cierre']);

        return response()->json([
            'empresa' => $empresa->nombre,
            'ticker' => $empresa->ticker,
            'datos' => $historico
        ]);
    }
    public function ticks($ticker)
{
    $empresa = Empresa::where('ticker', $ticker)->firstOrFail();

    $ticks = $empresa->ticks()
        ->orderBy('registrado_en', 'desc')
        ->limit(50)
        ->get()
        ->reverse()
        ->values();

    return response()->json($ticks);
}

}

