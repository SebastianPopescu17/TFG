<?php

namespace App\Http\Controllers;

use App\Models\Alerta;
use Illuminate\Http\Request;

class AlertaController extends Controller
{
    public function index($userId)
    {
        return Alerta::with('empresa')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function store(Request $request, $userId)
{
    $validated = $request->validate([
        'empresa_id' => 'required|exists:empresas,id',
        'tipo'       => 'required|string|in:precio,noticia,otro',
        'condicion'  => 'required|string|in:mayor,menor,igual,entre',
        'valor'      => 'required',
        'activa'     => 'boolean'
    ]);

    // Normalizar valor a JSON
    if (!is_array($validated['valor'])) {
        if (str_contains($validated['valor'], ',')) {
            $validated['valor'] = explode(',', $validated['valor']);
        } else {
            $validated['valor'] = [(float)$validated['valor']];
        }
    }

    $alerta = Alerta::create([
        'user_id' => $userId,
        'empresa_id' => $validated['empresa_id'],
        'tipo' => $validated['tipo'],
        'condicion' => $validated['condicion'],
        'valor' => $validated['valor'],
        'activa' => $validated['activa'] ?? true,
    ]);

    return response()->json($alerta->load('empresa'), 201);
}


    public function destroy($userId, $alertaId)
    {
        $alerta = Alerta::where('user_id', $userId)
            ->where('id', $alertaId)
            ->firstOrFail();

        $alerta->delete();

        return response()->json(['message' => 'Alerta eliminada correctamente']);
    }

    public function update(Request $request, $userId, $alertaId)
{
    $alerta = Alerta::where('user_id', $userId)
        ->where('id', $alertaId)
        ->firstOrFail();

    $validated = $request->validate([
        'empresa_id' => 'sometimes|exists:empresas,id',
        'tipo'       => 'sometimes|string|in:precio,noticia,otro',
        'condicion'  => 'sometimes|string|in:mayor,menor,igual,entre',
        'valor'      => 'sometimes',
        'activa'     => 'sometimes|boolean',
        'fecha_cumplida' => 'sometimes|date'
    ]);

    if (isset($validated['valor']) && !is_array($validated['valor'])) {
        if (str_contains($validated['valor'], ',')) {
            $validated['valor'] = explode(',', $validated['valor']);
        } else {
            $validated['valor'] = [(float)$validated['valor']];
        }
    }

    $alerta->update($validated);

    return response()->json($alerta->load('empresa'));
}

    public function evaluar($id)
{
    $alertas = Alerta::with('empresa')
        ->where('user_id', $id)
        ->where('activa', true)
        ->get();

    foreach ($alertas as $alerta) {
        $precio = $alerta->empresa?->precio_actual ?? 0;

        $valor = $alerta->valor; 

        $v0 = $valor[0] ?? null;
        $v1 = $valor[1] ?? null;

        $cumple = match ($alerta->condicion) {
            'mayor' => $v0 !== null && $precio > $v0,
            'menor' => $v0 !== null && $precio < $v0,
            'igual' => $v0 !== null && abs($precio - $v0) < 0.01,
            'entre' => $v0 !== null && $v1 !== null && $precio >= $v0 && $precio <= $v1,
            default => false,
        };

        if ($cumple) {
            $alerta->update([
                'activa' => false,
                'fecha_cumplida' => now(),
            ]);
        }
    }

    return Alerta::with('empresa')
        ->where('user_id', $id)
        ->orderBy('created_at', 'desc')
        ->get();
}


}
