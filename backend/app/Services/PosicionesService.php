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
            // Actualizar cantidad e invertido
            $pos->cantidad  = round($pos->cantidad + $op->cantidad, 2);
            $pos->invertido = round($pos->invertido + ($op->cantidad * $op->precio), 2);
        }

        if ($op->tipo === 'venta') {
            // Asegurar que no se venda más de lo disponible
            $sellQty = min($op->cantidad, $pos->cantidad);
            $op->cantidad = $sellQty;

            // Calcular plusvalia
            $op->plusvalia = round($sellQty * ($op->precio - $pos->precio_medio), 2);
            $op->save();

            // Actualizar posición
            $pos->cantidad  = round($pos->cantidad - $sellQty, 2);
            $pos->invertido = round($pos->invertido - ($sellQty * $pos->precio_medio), 2);

            if ($pos->cantidad <= 0) {
                $pos->cantidad = 0;
                $pos->invertido = 0;
                $pos->precio_medio = 0;
            }
        }

        // Actualizar precio medio si quedan acciones
        if ($pos->cantidad > 0) {
            $pos->precio_medio = round($pos->invertido / $pos->cantidad, 2);
        } else {
            $pos->precio_medio = 0;
        }

        $pos->save();
    }
}
