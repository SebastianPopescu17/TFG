<?php

namespace App\Http\Controllers;

use App\Models\Operacion;
use App\Models\Posicion;
use App\Services\PosicionesService;
use App\Models\MovimientoSaldo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CarteraController extends Controller
{
    public function comprar(Request $request, PosicionesService $svc)
    {
        $data = $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'cantidad'   => 'required|numeric|min:0.01',
            'precio'     => 'required|numeric|min:0',
        ]);

        $user = $request->user();
        $coste = $data['cantidad'] * $data['precio'];

        if ($user->saldo < $coste) {
            return response()->json(['error' => 'Saldo insuficiente'], 422);
        }

        return DB::transaction(function () use ($user, $data, $svc, $coste) {
            $op = Operacion::create([
                'user_id'    => $user->id,
                'empresa_id' => $data['empresa_id'],
                'tipo'       => 'compra',
                'cantidad'   => $data['cantidad'],
                'precio'     => $data['precio'],
            ]);

            // Descontar saldo
            $user->saldo -= $coste;
            $user->save();

            // Actualizar posición
            $svc->aplicarOperacion($op);

            return response()->json($op->load('empresa'), 201);
        });
    }

    public function vender(Request $request, PosicionesService $svc)
    {
        $data = $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'cantidad'   => 'required|numeric|min:0.01',
            'precio'     => 'required|numeric|min:0',
        ]);

        $user = $request->user();

        $pos = Posicion::where('user_id', $user->id)
            ->where('empresa_id', $data['empresa_id'])
            ->first();

        if (!$pos || $pos->cantidad < $data['cantidad']) {
            return response()->json(['error' => 'No tienes suficientes acciones para vender'], 422);
        }

        $ingreso = $data['cantidad'] * $data['precio'];

        return DB::transaction(function () use ($user, $data, $svc, $ingreso) {
            $op = Operacion::create([
                'user_id'    => $user->id,
                'empresa_id' => $data['empresa_id'],
                'tipo'       => 'venta',
                'cantidad'   => $data['cantidad'],
                'precio'     => $data['precio'],
            ]);

            // Actualizar posición y calcular plusvalía
            $svc->aplicarOperacion($op);

            // Abonar saldo
            $user->saldo += $ingreso;
            $user->save();

            return response()->json($op->load('empresa'), 201);
        });
    }

  public function cartera(Request $request)
{
    $userId = $request->user()->id;

    $posiciones = DB::table('posiciones as pos')
    ->join('empresas as e', 'pos.empresa_id', '=', 'e.id')

    ->leftJoin(DB::raw('(
        SELECT p1.empresa_id, p1.precio
        FROM precios p1
        INNER JOIN (
            SELECT empresa_id, MAX(created_at) as max_created
            FROM precios
            GROUP BY empresa_id
        ) p2
        ON p1.empresa_id = p2.empresa_id AND p1.created_at = p2.max_created
    ) as ultimos'), 'ultimos.empresa_id', '=', 'e.id')
    ->where('pos.user_id', $userId)
    ->where('pos.cantidad', '>', 0)
        ->select(
    'e.id as empresa_id',
    'e.nombre as empresa',
    'e.ticker',
    'pos.cantidad',
    'pos.precio_medio',
    'pos.invertido',
    DB::raw('COALESCE(ultimos.precio, pos.precio_medio) as precio_actual'),
    DB::raw('COALESCE(pos.cantidad * ultimos.precio, pos.invertido) as valor_actual'),
    DB::raw('COALESCE(pos.cantidad * ultimos.precio - pos.invertido, 0) as rentabilidad'),

    DB::raw('CASE WHEN pos.invertido > 0
        THEN (COALESCE(pos.cantidad * ultimos.precio, pos.invertido) - pos.invertido) / pos.invertido * 100
        ELSE 0 END as rentabilidad_pct')
)
        ->get();

    $totalInvertido = $posiciones->sum('invertido');
    $totalActual = $posiciones->sum('valor_actual');

    return response()->json([
        'saldo'              => $request->user()->saldo,
        'total_invertido'    => round($totalInvertido, 2),
        'total_actual'       => round($totalActual, 2),
        'rentabilidad_total' => round($totalActual - $totalInvertido, 2),
        'rentabilidad_pct'   => $totalInvertido > 0
            ? round((($totalActual - $totalInvertido) / $totalInvertido) * 100, 2)
            : 0,
        'detalle'            => $posiciones,
    ]);
}



    public function operaciones(Request $request)
    {
        $ops = Operacion::with('empresa')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at','desc')
            ->paginate(50);

        return response()->json($ops);
    }

    public function saldo(Request $request)
{
    return response()->json(['saldo' => $request->user()->saldo]);
}

public function ingresar(Request $request)
{
    $data = $request->validate([
        'monto' => 'required|numeric|min:0.01',
    ]);

    $user = $request->user();
    $user->saldo += $data['monto'];
    $user->save();

    // Guardar movimiento
    DB::table('movimientos_saldo')->insert([
        'user_id' => $user->id,
        'tipo' => 'ingreso',
        'monto' => $data['monto'],
        'saldo_resultante' => $user->saldo,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return response()->json([
        'message' => 'Saldo ingresado correctamente',
        'saldo'   => $user->saldo,
    ]);
}

public function retirar(Request $request)
{
    $data = $request->validate([
        'monto' => 'required|numeric|min:0.01',
    ]);

    $user = $request->user();

    if ($user->saldo < $data['monto']) {
        return response()->json(['error' => 'Saldo insuficiente'], 422);
    }

    $user->saldo -= $data['monto'];
    $user->save();

    // Guardar movimiento
    DB::table('movimientos_saldo')->insert([
        'user_id' => $user->id,
        'tipo' => 'retiro',
        'monto' => $data['monto'],
        'saldo_resultante' => $user->saldo,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return response()->json([
        'message' => 'Saldo retirado correctamente',
        'saldo'   => $user->saldo,
    ]);
}
public function movimientosSaldo(Request $request)
{
    $movimientos = MovimientoSaldo::where('user_id', $request->user()->id)
        ->orderBy('created_at', 'desc')
        ->paginate(20);

    return response()->json($movimientos);
}
public function posicion(Request $request, $empresaId)
{
    $user = $request->user();

    $pos = Posicion::with('empresa')
        ->where('user_id', $user->id)
        ->where('empresa_id', $empresaId)
        ->first();

    if (!$pos) {
        return response()->json([
            'empresa_id' => $empresaId,
            'cantidad' => 0,
            'invertido' => 0,
            'precio_medio' => 0,
        ]);
    }

    return response()->json([
        'empresa_id'   => $pos->empresa_id,
        'empresa'      => $pos->empresa->nombre,
        'ticker'       => $pos->empresa->ticker,
        'cantidad'     => round($pos->cantidad, 6),
        'invertido'    => round($pos->invertido, 2),
        'precio_medio' => round($pos->precio_medio, 6),
    ]);
}

}
