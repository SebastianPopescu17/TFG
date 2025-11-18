<?php

namespace App\Http\Controllers;

use App\Models\IndicadorMacro;
use Illuminate\Http\Request;

class IndicadorMacroController extends Controller
{
    // GET /indicadores
    public function index(Request $request)
    {
        $q = IndicadorMacro::query();

        if ($pais = $request->query('pais')) {
            $q->where('pais', strtoupper($pais));
        }

        if ($codigo = $request->query('codigo')) {
            $q->where('codigo', strtoupper($codigo));
        }

        $desde = (int)($request->query('desde', 2000));
        $hasta = (int)($request->query('hasta', date('Y')));

        $q->whereBetween('anio', [$desde, $hasta]);

        $sort = $request->query('sort', 'desc');
        $q->orderBy('anio', $sort === 'asc' ? 'asc' : 'desc');

        $limit = (int)$request->query('limit', 500);

        return $q->limit($limit)->get();
    }

    // GET /indicadores/series
    public function series(Request $request)
    {
        $paises = array_filter(array_map('strtoupper', explode(',', (string)$request->query('paises'))));
        $codigos = array_filter(array_map('strtoupper', explode(',', (string)$request->query('codigos'))));
        $desde = (int)($request->query('desde', 2000));
        $hasta = (int)($request->query('hasta', date('Y')));

        $q = IndicadorMacro::query()
            ->whereBetween('anio', [$desde, $hasta]);

        if ($paises) {
            $q->whereIn('pais', $paises);
        }
        if ($codigos) {
            $q->whereIn('codigo', $codigos);
        }

        $data = $q->orderBy('anio', 'asc')->get();

        $result = [];
        foreach ($data as $row) {
            $result[$row->codigo][$row->pais][] = [
                'anio'       => $row->anio,
                'valor_usd'  => $row->valor_usd,
                'valor_eur'  => $row->valor_eur,
                'variacion'  => $row->variacion,
                'unidad'     => $row->unidad,
                'nombre'     => $row->nombre,
            ];
        }

        return response()->json($result);
    }

    // GET /indicadores/kpi
    public function kpi(Request $request)
    {
        $pais = strtoupper((string)$request->query('pais', 'ESP'));
        $codigos = array_filter(array_map('strtoupper', explode(',', (string)$request->query('codigos'))));

        $result = [];
        foreach ($codigos as $code) {
            $row = IndicadorMacro::where('pais', $pais)
                ->where('codigo', $code)
                ->orderBy('anio', 'desc')
                ->first();

            if ($row) {
                $result[$code] = [
                    'anio'       => $row->anio,
                    'valor_usd'  => $row->valor_usd,
                    'valor_eur'  => $row->valor_eur,
                    'variacion'  => $row->variacion,
                    'unidad'     => $row->unidad,
                    'nombre'     => $row->nombre,
                ];
            }
        }

        return response()->json($result);
    }

    // GET /indicadores/compare
    public function compare(Request $request)
    {
        $codigo = strtoupper((string)$request->query('codigo'));
        $anio = (int)$request->query('anio', date('Y'));
        $paises = array_filter(array_map('strtoupper', explode(',', (string)$request->query('paises'))));

        $q = IndicadorMacro::where('codigo', $codigo)
            ->where('anio', $anio);

        if ($paises) {
            $q->whereIn('pais', $paises);
        }

        return $q->orderBy('valor_usd', 'desc')->get();
    }

    // GET /indicadores/paises
    public function paises()
    {
        $paises = IndicadorMacro::select('pais')
            ->distinct()
            ->orderBy('pais')
            ->pluck('pais');

        return response()->json($paises);
    }

    // GET /indicadores/disponibles
    public function disponibles()
    {
        $indicadores = IndicadorMacro::select('codigo','nombre')
            ->distinct()
            ->orderBy('nombre')
            ->get();

        return response()->json($indicadores);
    }
}
