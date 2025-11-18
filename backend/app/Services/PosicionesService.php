<?php

namespace App\Services;

use App\Models\Posicion;
use App\Models\Operacion;

class PosicionesService
{
    public function aplicarOperacion(Operacion $op): void
    {
        $pos = Posicion::firstOrCreate(
            ['user_id' => $op->user_id, 'empresa_id' => $op->empresa_id],
            ['cantidad' => 0, 'invertido' => 0, 'precio_medio' => 0]
        );

        if ($op->tipo === 'compra') {
            $pos->cantidad   += $op->cantidad;
            $pos->invertido  += $op->cantidad * $op->precio;
        }

        if ($op->tipo === 'venta') {

            $op->plusvalia = $op->cantidad * ($op->precio - $pos->precio_medio);
            $op->save();

            $pos->cantidad   -= $op->cantidad;
            $pos->invertido  -= $op->cantidad * $pos->precio_medio;

            if ($pos->cantidad <= 0) {
                $pos->cantidad = 0;
                $pos->invertido = 0;
                $pos->precio_medio = 0;
            }
        }

        if ($pos->cantidad > 0) {
            $pos->precio_medio = $pos->invertido / $pos->cantidad;
        }

        $pos->save();
    }
}
