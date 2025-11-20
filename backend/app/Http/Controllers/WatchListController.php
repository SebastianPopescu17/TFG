<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Watchlist;
use App\Models\User;
use App\Models\Empresa;

class WatchlistController extends Controller
{
    public function index($id)
    {
        $user = User::findOrFail($id);

        // Devuelve directamente las empresas favoritas
        $empresas = Empresa::whereIn('id', function ($query) use ($user) {
            $query->select('empresa_id')
                  ->from('watchlists')
                  ->where('user_id', $user->id);
        })->get();

        return response()->json($empresas);
    }

    public function store(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $empresa = Empresa::where('ticker', $request->ticker)->firstOrFail();

        Watchlist::firstOrCreate([
            'user_id'    => $user->id,
            'empresa_id' => $empresa->id
        ]);

        return response()->json([
            'message' => 'Empresa añadida a la watchlist',
            'empresa' => $empresa
        ]);
    }

    public function destroy($id, $empresa)
    {
        $user = User::findOrFail($id);

        if (is_numeric($empresa)) {
            Watchlist::where('user_id', $user->id)
                ->where('empresa_id', $empresa)
                ->delete();
        } else {
            $empresaModel = Empresa::where('ticker', $empresa)->firstOrFail();
            Watchlist::where('user_id', $user->id)
                ->where('empresa_id', $empresaModel->id)
                ->delete();
        }

        return response()->json(['message' => 'Empresa eliminada de la watchlist']);
    }
}
