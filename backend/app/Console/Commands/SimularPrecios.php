<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Empresa;
use App\Models\Tick;

class SimularPrecios extends Command
{
    protected $signature = 'simular:precios {--interval=5}';
    protected $description = 'Simula cambios de precios de empresas en tiempo real (para pruebas con polling)';

    public function handle()
    {
        $interval = (int) $this->option('interval');
        $this->info("Simulando precios cada {$interval} segundos... (Ctrl+C para salir)");

        while (true) {
            $empresas = Empresa::all();

            foreach ($empresas as $empresa) {
                $precioAnterior = $empresa->precio_actual;

                // Variación aleatoria entre -2% y +2%
                $variacion = $precioAnterior * (rand(-200, 200) / 10000);
                $nuevoPrecio = max(0.01, $precioAnterior + $variacion);

                $empresa->precio_actual = round($nuevoPrecio, 2);
                $empresa->save();

                // Generar OHLC para la vela
                $apertura = $precioAnterior;
                $cierre   = $empresa->precio_actual;
                $maximo   = max($apertura, $cierre) + rand(0, 50) / 100; 
                $minimo   = min($apertura, $cierre) - rand(0, 50) / 100;

                Tick::create([
                    'empresa_id'    => $empresa->id,
                    'apertura'      => round($apertura, 2),
                    'maximo'        => round($maximo, 2),
                    'minimo'        => round($minimo, 2),
                    'cierre'        => round($cierre, 2),
                    'registrado_en' => now(),
                ]);

                $this->line("{$empresa->ticker}: {$empresa->precio_actual}");
            }

            sleep($interval);
        }
    }
}
