<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\OrdenProgramada;
use App\Models\Operacion;
use App\Models\MovimientoSaldo;
use App\Services\PosicionesService;
use Illuminate\Support\Facades\DB;

class ProcesarOrdenes extends Command
{
    protected $signature = 'ordenes:procesar {--loop} {--interval=5}';
    protected $description = 'Procesa las ordenes programadas pendientes y las ejecuta si se cumplen las condiciones';

    public function handle()
    {
        $loop = $this->option('loop');
        $interval = (int)$this->option('interval');

        if ($loop) {
            $this->info("Procesando órdenes en bucle (intervalo: {$interval}s)...");
            while (true) {
                $this->processOnce();
                sleep($interval);
            }
        } else {
            $this->processOnce();
        }
    }

    protected function processOnce()
    {
        $this->info('Buscando órdenes pendientes...');
        $ordenes = OrdenProgramada::pendientes()->with(['user','empresa'])->get();

        foreach ($ordenes as $orden) {
            try {
                DB::beginTransaction();
                $user = $orden->user;
                $empresa = $orden->empresa;
                $precioActual = round($empresa->precio_actual, 2);
                $cantidad = round($orden->cantidad, 2);
                $debeEjecutar = false;

                // Condición de precio objetivo
                if ($orden->precio_objetivo !== null) {
                    $precioObjetivo = round($orden->precio_objetivo, 2);
                    if ($orden->tipo === OrdenProgramada::TIPO_COMPRA && $precioActual <= $precioObjetivo) {
                        $debeEjecutar = true;
                    }
                    if ($orden->tipo === OrdenProgramada::TIPO_VENTA && $precioActual >= $precioObjetivo) {
                        $debeEjecutar = true;
                    }
                }

                // Condición de fecha programada
                if (!$debeEjecutar && $orden->scheduled_at && now()->greaterThanOrEqualTo($orden->scheduled_at)) {
                    $debeEjecutar = true;
                }

                if (!$debeEjecutar) {
                    DB::commit();
                    continue;
                }

                $svc = app(PosicionesService::class);

                if ($orden->tipo === OrdenProgramada::TIPO_COMPRA) {
                    $total = round($precioActual * $cantidad, 2);

                    if ($user->saldo < $total) {
                        $orden->estado = OrdenProgramada::ESTADO_CANCELADA;
                        $orden->motivo_cancelacion = 'Saldo insuficiente';
                        $orden->save();
                        DB::commit();
                        $this->info("Orden {$orden->id} cancelada: saldo insuficiente");
                        continue;
                    }

                    $op = Operacion::create([
                        'user_id' => $user->id,
                        'empresa_id' => $empresa->id,
                        'tipo' => 'compra',
                        'cantidad' => $cantidad,
                        'precio' => $precioActual,
                        'plusvalia' => 0
                    ]);

                    // Actualizar saldo
                    $user->saldo = round($user->saldo - $total, 2);
                    $user->save();

                    MovimientoSaldo::create([
                        'user_id' => $user->id,
                        'tipo' => 'compra',
                        'monto' => -$total,
                        'saldo_resultante' => $user->saldo,
                    ]);

                    // Aplicar operación sobre posiciones
                    $svc->aplicarOperacion($op);

                    $orden->estado = OrdenProgramada::ESTADO_CUMPLIDA;
                    $orden->cantidad_ejecutada = $cantidad;
                    $orden->save();

                    $this->info("Orden {$orden->id} ejecutada: compra {$cantidad} @ {$precioActual}");
                }

                if ($orden->tipo === OrdenProgramada::TIPO_VENTA) {
                    $pos = $orden->user->posiciones()->where('empresa_id', $empresa->id)->first();
                    $disponible = $pos ? round($pos->cantidad, 2) : 0;

                    if ($disponible <= 0) {
                        $orden->estado = OrdenProgramada::ESTADO_CANCELADA;
                        $orden->motivo_cancelacion = 'No posee acciones';
                        $orden->save();
                        DB::commit();
                        $this->info("Orden {$orden->id} cancelada: sin acciones");
                        continue;
                    }

                    $sellQty = min($cantidad, $disponible);
                    if ($sellQty <= 0) {
                        $orden->estado = OrdenProgramada::ESTADO_CANCELADA;
                        $orden->motivo_cancelacion = 'Cantidad a vender no válida';
                        $orden->save();
                        DB::commit();
                        continue;
                    }

                    $op = Operacion::create([
                        'user_id' => $user->id,
                        'empresa_id' => $empresa->id,
                        'tipo' => 'venta',
                        'cantidad' => $sellQty,
                        'precio' => $precioActual,
                        'plusvalia' => 0
                    ]);

                    // Aplicar operación sobre posiciones
                    $svc->aplicarOperacion($op);

                    // Abonar saldo
                    $revenue = round($sellQty * $precioActual, 2);
                    $user->saldo = round($user->saldo + $revenue, 2);
                    $user->save();

                    MovimientoSaldo::create([
                        'user_id' => $user->id,
                        'tipo' => 'venta',
                        'monto' => $revenue,
                        'saldo_resultante' => $user->saldo,
                    ]);

                    $orden->estado = OrdenProgramada::ESTADO_CUMPLIDA;
                    $orden->cantidad_ejecutada = $sellQty;
                    $orden->save();

                    $this->info("Orden {$orden->id} ejecutada: venta {$sellQty} @ {$precioActual}");
                }

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                $this->error("Error procesando orden {$orden->id}: {$e->getMessage()}");
            }
        }

        $this->info('Iteración completa.');
    }
}
