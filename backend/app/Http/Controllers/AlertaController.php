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
            'condicion'  => 'required|string|in:mayor,menor,igual',
            'valor'      => 'required|numeric',
            'activa'     => 'boolean'
        ]);

        $alerta = Alerta::create([
            'user_id'    => $userId,
            'empresa_id' => $validated['empresa_id'],
            'tipo'       => $validated['tipo'],
            'condicion'  => $validated['condicion'],
            'valor'      => $validated['valor'],
            'activa'     => $validated['activa'] ?? true,
        ]);

        return response()->json($alerta->load('empresa'),201);
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
        'condicion'  => 'sometimes|string|in:mayor,menor,igual',
        'valor'      => 'sometimes|numeric',
        'activa'     => 'sometimes|boolean'
    ]);

    $alerta->update($validated);

    return response()->json($alerta->load('empresa'));
}

}
