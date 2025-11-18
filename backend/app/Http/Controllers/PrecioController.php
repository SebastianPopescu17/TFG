<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


use App\Models\Precio;


class PrecioController extends Controller
{
    public function store(Request $request, $id)
    {
        $precio = Precio::create([
            'empresa_id' => $id,
            'precio' => $request->precio,
        ]);

        return response()->json($precio, 201);
    }

    public function ultimos()
{
    $sub = DB::table('precios')
        ->select('empresa_id', DB::raw('MAX(created_at) as max_created'))
        ->groupBy('empresa_id');

    $precios = DB::table('precios as p')
        ->joinSub($sub, 'sub', function ($join) {
            $join->on('p.empresa_id', '=', 'sub.empresa_id')
                 ->on('p.created_at', '=', 'sub.max_created');
        })
        ->select('p.empresa_id', 'p.precio', 'p.created_at')
        ->get();

    return response()->json($precios);
}


}
