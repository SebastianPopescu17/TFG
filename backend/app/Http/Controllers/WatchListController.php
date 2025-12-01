<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Watchlist;
use App\Models\User;
use App\Models\Empresa;
use Illuminate\Support\Facades\Auth;

class WatchlistController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $empresas = Empresa::whereIn('id', function ($query) use ($user) {
            $query->select('empresa_id')
                  ->from('watchlists')
                  ->where('user_id', $user->id);
        })->get();

        return response()->json($empresas);
    }

    public function store(Request $request)
{
    $user = Auth::user();
    $empresa = Empresa::where('ticker', $request->ticker)->firstOrFail();

    $existe = Watchlist::where('user_id', $user->id)
                       ->where('empresa_id', $empresa->id)
                       ->exists();

    if ($existe) {
        return response()->json([
            'message' => 'La empresa ya está en tu watchlist',
            'empresa' => $empresa
        ], 409); 
    }

    Watchlist::create([
        'user_id'    => $user->id,
        'empresa_id' => $empresa->id
    ]);

    return response()->json([
        'message' => 'Empresa añadida a la watchlist',
        'empresa' => $empresa
    ]);
}


    public function destroy($empresa)
    {
        $user = Auth::user();

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

