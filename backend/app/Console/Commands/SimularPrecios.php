<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Empresa;
use App\Models\Tick;

class SimularPrecios extends Command
{
    protected $signature = 'simular:precios {--loop} {--interval=5}';
    protected $description = 'Simula cambios de precios de empresas y genera ticks OHLC';

    public function handle()
    {
        $loop = $this->option('loop');
        $interval = (int) $this->option('interval');

        if ($loop) {
            $this->info("Simulando precios en bucle cada {$interval} segundos... (Ctrl+C para salir)");
            while (true) {
                $this->simular();
                sleep($interval);
            }
        } else {
            $this->simular();
        }
    }

    private function simular(): void
    {
        $empresas = Empresa::all();

        foreach ($empresas as $empresa) {
            $precioAnterior = $empresa->precio_actual;

            // Variación aleatoria -2% a +2%
            $variacion = $precioAnterior * (rand(-200, 200) / 10000);
            $nuevoPrecio = max(0.01, $precioAnterior + $variacion);

            $empresa->update(['precio_actual' => round($nuevoPrecio, 2)]);

            // Tick OHLC
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
        }

        $this->info('Precios simulados y ticks generados.');
    }
}
