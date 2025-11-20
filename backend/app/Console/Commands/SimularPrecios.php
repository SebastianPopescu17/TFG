<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Empresa;
use App\Models\Tick;

class SimularPrecios extends Command
{
    protected $signature = 'simular:precios {--loop} {--interval=5}';
    protected $description = 'Simula cambios de precios de empresas y genera ticks OHLC con comportamiento por sector';

    private array $comportamientoPorSector = [
        'Energía'            => ['volatilidad' => 0.6, 'tendencia' => 0.0002],
        'Tecnología'         => ['volatilidad' => 1.2, 'tendencia' => 0.0005],
        'Banca'              => ['volatilidad' => 0.4, 'tendencia' => -0.0001],
        'Salud'              => ['volatilidad' => 0.5, 'tendencia' => 0.0003],
        'Turismo'            => ['volatilidad' => 1.0, 'tendencia' => 0.0001],
        'Automoción'         => ['volatilidad' => 0.8, 'tendencia' => 0.0002],
        'Infraestructuras'   => ['volatilidad' => 0.3, 'tendencia' => 0.0001],
        'Consumo'            => ['volatilidad' => 0.7, 'tendencia' => 0.0002],
        'Telecomunicaciones' => ['volatilidad' => 0.5, 'tendencia' => 0.0002],
        'Inmobiliario'       => ['volatilidad' => 0.6, 'tendencia' => -0.0002],
    ];

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
            $sector = $empresa->sector ?? 'General';

            $config = $this->comportamientoPorSector[$sector] ?? ['volatilidad' => 0.7, 'tendencia' => 0.0001];
            $volatilidad = $config['volatilidad'];
            $tendencia   = $config['tendencia'];

            // Variación pseudo-normal + tendencia
            $variacion = $precioAnterior * ((rand(0,100) - rand(0,100)) / 10000) * $volatilidad;
            $variacion += $precioAnterior * $tendencia;

            $nuevoPrecio = max(0.01, $precioAnterior + $variacion);
            $empresa->update(['precio_actual' => round($nuevoPrecio, 2)]);

            // OHLC coherente
            $apertura = $precioAnterior;
            $cierre   = $empresa->precio_actual;
            $maximo   = round(max($apertura, $cierre) + abs(rand(-10,10)/100), 2);
            $minimo   = round(min($apertura, $cierre) - abs(rand(-10,10)/100), 2);

            Tick::create([
                'empresa_id'    => $empresa->id,
                'apertura'      => round($apertura, 2),
                'maximo'        => max($maximo, $apertura, $cierre),
                'minimo'        => max(0.01, min($minimo, $apertura, $cierre)),
                'cierre'        => round($cierre, 2),
                'registrado_en' => now(),
            ]);
        }

        $this->info('Precios simulados y ticks generados con comportamiento por sector.');
    }
}
