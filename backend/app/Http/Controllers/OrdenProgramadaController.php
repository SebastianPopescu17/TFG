<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OrdenProgramada;
use App\Models\Posicion;
use App\Models\Empresa;

class OrdenProgramadaController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $ordenes = OrdenProgramada::where('user_id', $user->id)
            ->with('empresa')
            ->orderBy('created_at','desc')
            ->get();

        return response()->json($ordenes);
    }

   public function store(Request $request)
{
    $data = $request->validate([
        'empresa_id' => 'required|exists:empresas,id',
        'tipo' => 'required|in:compra,venta',
        'cantidad' => 'required|numeric|min:0.01',
        'precio_objetivo' => 'nullable|numeric|min:0',
        'scheduled_at' => 'nullable|date'
    ]);

    $user = $request->user();
    $data['user_id'] = $user->id;
    $cantidad = round($data['cantidad'], 2);

    // Validaciones para compra
    if ($data['tipo'] === 'compra') {
        if ($user->saldo <= 0) {
            return response()->json(['error' => 'No tienes saldo suficiente para crear una orden de compra'], 422);
        }

        if (!isset($data['precio_objetivo']) || $data['precio_objetivo'] <= 0) {
            return response()->json(['error' => 'Debes indicar un precio objetivo válido para la orden de compra'], 422);
        }

        $importeEsperado = round($cantidad * $data['precio_objetivo'], 2);
        if ($importeEsperado > $user->saldo) {
            return response()->json(['error' => 'No tienes saldo suficiente para la cantidad y precio objetivo indicados'], 422);
        }
    }

    // Validaciones para venta
    if ($data['tipo'] === 'venta') {
        $pos = Posicion::where('user_id', $user->id)
            ->where('empresa_id', $data['empresa_id'])
            ->first();

        $available = $pos ? round($pos->cantidad, 2) : 0;
        if ($available <= 0) {
            return response()->json(['error' => 'No tienes acciones de esta empresa para programar una venta'], 422);
        }

        if ($cantidad > $available) {
            return response()->json(['error' => 'La cantidad a vender excede las acciones disponibles'], 422);
        }

        if (!isset($data['precio_objetivo']) || $data['precio_objetivo'] <= 0) {
            return response()->json(['error' => 'Debes indicar un precio objetivo válido para la orden de venta'], 422);
        }
    }

    $orden = OrdenProgramada::create($data);

    // Devolver con empresa cargada
    $orden->load('empresa');

    return response()->json($orden, 201);
}



    public function show(Request $request, $id)
    {
        $user = $request->user();
        $orden = OrdenProgramada::where('user_id', $user->id)
            ->with('empresa')
            ->findOrFail($id);

        return response()->json($orden);
    }

    public function cancelar(Request $request, $id)
    {
        $user = $request->user();
        $orden = OrdenProgramada::where('user_id', $user->id)->findOrFail($id);
        if ($orden->estado !== OrdenProgramada::ESTADO_PENDIENTE) {
            return response()->json(['error' => 'Solo se pueden cancelar ordenes pendientes'], 422);
        }

        $orden->estado = OrdenProgramada::ESTADO_CANCELADA;
        $orden->motivo_cancelacion = $request->input('motivo', 'Cancelada por el usuario');
        $orden->save();

        $orden->load('empresa');

        return response()->json($orden);
    }

    public function destroy(Request $request, $id)
{
    $user = $request->user();
    $orden = OrdenProgramada::where('user_id', $user->id)->findOrFail($id);

    $orden->delete();

    return response()->json(['message' => 'Orden eliminada correctamente']);
}
}
