<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Empresa;
use App\Models\PrecioHistorico;
use Carbon\Carbon;

class CalculadoraController extends Controller
{
    public function rentabilidad(Request $request)
    {
        $request->validate([
            'ticker' => 'required|string|exists:empresas,ticker',
            'cantidad' => 'required|numeric|min:1',
            'fecha_compra' => 'required|date'
        ]);

        $empresa = Empresa::where('ticker', strtoupper($request->ticker))->firstOrFail();

        // Precio en la fecha de compra (o el más cercano posterior)
        $precioCompra = PrecioHistorico::where('empresa_id', $empresa->id)
            ->whereDate('fecha', '>=', $request->fecha_compra)
            ->orderBy('fecha', 'asc')
            ->first();

        if (!$precioCompra) {
            return response()->json(['error' => 'No hay datos históricos desde esa fecha'], 404);
        }

        $precioActual = $empresa->precio_actual;

        $valorInicial = $request->cantidad;
        $accionesCompradas = $valorInicial / $precioCompra->cierre;
        $valorFinal = $accionesCompradas * $precioActual;

        $rentabilidadAbsoluta = $valorFinal - $valorInicial;
        $rentabilidadPorcentual = ($rentabilidadAbsoluta / $valorInicial) * 100;

        // Calcular CAGR (rentabilidad anualizada)
        $años = Carbon::parse($request->fecha_compra)->diffInDays(Carbon::now()) / 365;
        $cagr = $años > 0 ? (pow($valorFinal / $valorInicial, 1 / $años) - 1) * 100 : null;

        return response()->json([
            'empresa' => $empresa->nombre,
            'valor_inicial' => round($valorInicial, 2),
            'valor_final' => round($valorFinal, 2),
            'rentabilidad_absoluta' => round($rentabilidadAbsoluta, 2),
            'rentabilidad_porcentual' => round($rentabilidadPorcentual, 2),
            'cagr' => $cagr ? round($cagr, 2) : null,
        ]);
    }
}
