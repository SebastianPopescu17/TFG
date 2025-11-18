<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Watchlist;
use App\Models\User;
use App\Models\Empresa;

class WatchlistController extends Controller
{
    // Listar la watchlist de un usuario
    public function index($id)
    {
        $user = User::findOrFail($id);
        $watchlist = Watchlist::with('empresa')->where('user_id', $user->id)->get();
        return response()->json($watchlist);
    }

    // Añadir empresa a la watchlist (por ticker)
    public function store(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Buscar empresa por ticker
        $empresa = Empresa::where('ticker', $request->ticker)->firstOrFail();

        $watch = Watchlist::firstOrCreate([
            'user_id'    => $user->id,
            'empresa_id' => $empresa->id
        ]);

        return response()->json([
            'message' => 'Empresa añadida a la watchlist',
            'watch'   => $watch
        ]);
    }

    // Eliminar empresa de la watchlist (acepta empresa_id o ticker)
    public function destroy($id, $empresa)
    {
        $user = User::findOrFail($id);

        // Si es numérico, asumimos que es empresa_id
        if (is_numeric($empresa)) {
            Watchlist::where('user_id', $user->id)
                ->where('empresa_id', $empresa)
                ->delete();
        } else {
            // Si es string, asumimos que es ticker
            $empresaModel = Empresa::where('ticker', $empresa)->firstOrFail();
            Watchlist::where('user_id', $user->id)
                ->where('empresa_id', $empresaModel->id)
                ->delete();
        }

        return response()->json(['message' => 'Empresa eliminada de la watchlist']);
    }
}
