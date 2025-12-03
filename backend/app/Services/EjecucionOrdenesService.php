<?php

namespace App\Services;

use App\Models\OrdenProgramada;
use App\Models\Posicion;
use App\Models\Operacion;
use App\Models\MovimientoSaldo;
use App\Services\PosicionesService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EjecucionOrdenesService
{
    protected PosicionesService $posService;

    public function __construct(PosicionesService $posService)
    {
        $this->posService = $posService;
    }

    public function procesar()
    {
        $ordenes = OrdenProgramada::pendientes()->with('user', 'empresa')->get();
        Log::info("Procesando " . $ordenes->count() . " orden(es) pendientes");

        foreach ($ordenes as $orden) {
            Log::info("Orden {$orden->id} tipo={$orden->tipo} estado={$orden->estado} precio_objetivo={$orden->precio_objetivo} scheduled_at={$orden->scheduled_at}");

            DB::transaction(function () use ($orden) {
                $user = $orden->user;
                $empresa = $orden->empresa;
                $precioActual = round($empresa->precio_actual, 2);

                Log::info("Empresa {$empresa->id} precio_actual={$precioActual}, saldo usuario={$user->saldo}");

                $debeEjecutar = false;

                // Condición por precio objetivo
                if ($orden->precio_objetivo !== null) {
                    $precioObjetivo = round($orden->precio_objetivo, 2);
                    Log::info("Comparando precio_actual={$precioActual} vs precio_objetivo={$precioObjetivo}");

                    if ($orden->tipo === OrdenProgramada::TIPO_COMPRA && $precioActual <= $precioObjetivo) {
                        $debeEjecutar = true;
                        Log::info("Condición de COMPRA cumplida");
                    }
                    if ($orden->tipo === OrdenProgramada::TIPO_VENTA && $precioActual >= $precioObjetivo) {
                        $debeEjecutar = true;
                        Log::info("Condición de VENTA cumplida");
                    }
                }

                // Condición por fecha programada
                if (!$debeEjecutar && $orden->scheduled_at && now()->greaterThanOrEqualTo($orden->scheduled_at)) {
                    $debeEjecutar = true;
                    Log::info("Condición de fecha programada cumplida (scheduled_at={$orden->scheduled_at})");
                }

                if (!$debeEjecutar) {
                    Log::info("Orden {$orden->id} NO se ejecuta todavía");
                    return;
                }

                $cantidad = round($orden->cantidad, 2);
                Log::info("Ejecutando orden {$orden->id} cantidad={$cantidad}");

                // --- COMPRA ---
                if ($orden->tipo === OrdenProgramada::TIPO_COMPRA) {
                    $total = round($cantidad * $precioActual, 2);
                    Log::info("Total a pagar={$total}, saldo actual={$user->saldo}");

                    if ($user->saldo < $total || $user->saldo <= 0) {
                        $orden->estado = OrdenProgramada::ESTADO_CANCELADA;
                        $orden->motivo_cancelacion = 'Saldo insuficiente al ejecutar orden programada';
                        $orden->save();
                        Log::warning("Orden {$orden->id} cancelada por saldo insuficiente");
                        return;
                    }

                    // Operación de compra
                    $op = Operacion::create([
                        'user_id' => $user->id,
                        'empresa_id' => $empresa->id,
                        'tipo' => Operacion::TIPO_COMPRA, // compra
                        'cantidad' => $cantidad,
                        'precio' => $precioActual,
                        'plusvalia' => 0
                    ]);
                    Log::info("Operacion de COMPRA registrada id={$op->id}");

                    // Actualizar saldo
                    $user->saldo = round($user->saldo - $total, 2);
                    $user->save();
                    Log::info("Saldo actualizado a {$user->saldo}");

                    // Movimiento de saldo (retiro)
                    MovimientoSaldo::create([
                        'user_id' => $user->id,
                        'tipo' => MovimientoSaldo::TIPO_RETIRO,
                        'monto' => -$total,
                        'saldo_resultante' => $user->saldo,
                    ]);

                    $this->posService->aplicarOperacion($op);

                    $orden->estado = OrdenProgramada::ESTADO_CUMPLIDA;
                    $orden->cantidad_ejecutada = $cantidad;
                    $orden->save();
                    Log::info("Orden {$orden->id} marcada como CUMPLIDA");
                }

                // --- VENTA ---
                if ($orden->tipo === OrdenProgramada::TIPO_VENTA) {
                    $pos = Posicion::where('user_id', $user->id)
                        ->where('empresa_id', $empresa->id)
                        ->first();

                    $available = $pos ? round($pos->cantidad, 2) : 0;
                    Log::info("Posición disponible={$available}");

                    if (!$pos || $available <= 0) {
                        $orden->estado = OrdenProgramada::ESTADO_CANCELADA;
                        $orden->motivo_cancelacion = 'No posee acciones para vender';
                        $orden->save();
                        Log::warning("Orden {$orden->id} cancelada por falta de acciones");
                        return;
                    }

                    $sellQty = min($cantidad, $available);
                    Log::info("Cantidad a vender={$sellQty}");

                    if ($sellQty <= 0) {
                        $orden->estado = OrdenProgramada::ESTADO_CANCELADA;
                        $orden->motivo_cancelacion = 'Cantidad a vender no válida';
                        $orden->save();
                        Log::warning("Orden {$orden->id} cancelada por cantidad inválida");
                        return;
                    }

                    $revenue = round($sellQty * $precioActual, 2);
                    Log::info("Revenue esperado={$revenue}");

                    // Operación de venta
                    $op = Operacion::create([
                        'user_id' => $user->id,
                        'empresa_id' => $empresa->id,
                        'tipo' => Operacion::TIPO_VENTA, // venta
                        'cantidad' => $sellQty,
                        'precio' => $precioActual,
                        'plusvalia' => 0
                    ]);
                    Log::info("Operacion de VENTA registrada id={$op->id}");

                    $this->posService->aplicarOperacion($op);

                    // Actualizar saldo
                    $user->saldo = round($user->saldo + $revenue, 2);
                    $user->save();
                    Log::info("Saldo actualizado a {$user->saldo}");

                    // Movimiento de saldo (ingreso)
                    MovimientoSaldo::create([
                        'user_id' => $user->id,
                        'tipo' => MovimientoSaldo::TIPO_INGRESO,
                        'monto' => $revenue,
                        'saldo_resultante' => $user->saldo,
                    ]);

                    $orden->estado = OrdenProgramada::ESTADO_CUMPLIDA;
                    $orden->cantidad_ejecutada = $sellQty;
                    $orden->save();
                    Log::info("Orden {$orden->id} marcada como CUMPLIDA");
                }
            });
        }
    }
}
