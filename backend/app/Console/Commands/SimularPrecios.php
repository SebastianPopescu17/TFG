<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Empresa;
use App\Models\Tick;

class SimularPrecios extends Command
{
    protected $signature = 'simular:precios {--loop} {--interval=5}';
    protected $description = 'Simula cambios de precios de empresas con dinámica de mercado avanzada';

    private array $comportamientoPorSector = [
        'Energía'            => ['volatilidad' => 0.6, 'tendencia' => 0.0],
        'Tecnología'         => ['volatilidad' => 1.2, 'tendencia' => 0.0002],
        'Banca'              => ['volatilidad' => 0.4, 'tendencia' => -0.0002],
        'Salud'              => ['volatilidad' => 0.5, 'tendencia' => 0.0001],
        'Turismo'            => ['volatilidad' => 1.0, 'tendencia' => -0.0001],
        'Automoción'         => ['volatilidad' => 0.8, 'tendencia' => 0.0000],
        'Infraestructuras'   => ['volatilidad' => 0.3, 'tendencia' => 0.0000],
        'Consumo'            => ['volatilidad' => 0.7, 'tendencia' => 0.0001],
        'Telecomunicaciones' => ['volatilidad' => 0.5, 'tendencia' => -0.0001],
        'Inmobiliario'       => ['volatilidad' => 0.6, 'tendencia' => -0.0003],
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

        // Factor global de mercado (índice)
        $indiceMercado = $this->generarVariacionNormal(0, 0.001);

        // Ciclo de mercado (bull/bear)
        $faseMercado = (int)(now()->timestamp / 3600) % 4 < 2 ? 0.0003 : -0.0003;

        foreach ($empresas as $empresa) {
            $precioAnterior = $empresa->precio_actual;
            $sector = $empresa->sector ?? 'General';

            $config = $this->comportamientoPorSector[$sector] ?? ['volatilidad' => 0.7, 'tendencia' => 0.0000];
            $volatilidad = $config['volatilidad'];
            $tendencia   = $config['tendencia'];

            // Ajuste por horario de mercado
            $hora = now()->hour;
            if ($hora >= 9 && $hora <= 17) {
                $volatilidad *= 1.5; // más volatilidad en horario de mercado
            } else {
                $volatilidad *= 0.3; // menos volatilidad fuera de mercado
            }

            // Volatilidad adaptativa (tipo GARCH simplificado)
            $ultimoTick = $empresa->ticks()->latest()->first();
            if ($ultimoTick) {
                $cambio = abs($ultimoTick->cierre - $precioAnterior) / max(0.01, $precioAnterior);
                $volatilidad *= 1 + $cambio * 5;
            }

            // Variación normal + tendencia + índice global + ciclo de mercado
            $variacion = $precioAnterior * $this->generarVariacionNormal(0, $volatilidad / 100);
            $variacion += $precioAnterior * $tendencia;
            $variacion += $precioAnterior * $indiceMercado;
            $variacion += $precioAnterior * $faseMercado;

            // Eventos externos (shocks)
            if (rand(0,500) < 2) { // 0.4% probabilidad
                $evento = rand(-1,1); // negativo o positivo
                $variacion *= 1 + ($evento * rand(5,20) / 100); // ±5–20%
            }

            // Correcciones si el precio se dispara demasiado
            if ($precioAnterior > 300) {
                $variacion -= $precioAnterior * 0.005;
            }

            $nuevoPrecio = max(0.01, $precioAnterior + $variacion);
            $empresa->update(['precio_actual' => round($nuevoPrecio, 2)]);

            // Generar tick OHLC
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

        $this->info('Precios simulados con dinámica avanzada: ciclos, shocks, volatilidad adaptativa y correcciones.');
    }

    private function generarVariacionNormal($media = 0, $desviacion = 1): float
    {
        // Método Box-Muller para aproximar distribución normal
        $u1 = mt_rand() / mt_getrandmax();
        $u2 = mt_rand() / mt_getrandmax();
        return $media + $desviacion * sqrt(-2 * log($u1)) * cos(2 * M_PI * $u2);
    }
}
