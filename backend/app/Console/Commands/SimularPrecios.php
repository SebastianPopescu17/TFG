<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Empresa;
use App\Models\Tick;

class SimularPrecios extends Command
{
    protected $signature = 'simular:precios {--loop} {--interval=5}';
    protected $description = 'Simula cambios de precios de empresas con dinámica de mercado realista';

    private array $comportamientoPorSector = [
        'Energía'            => ['volatilidad' => 0.4, 'tendencia' => 0.0001],
        'Tecnología'         => ['volatilidad' => 0.6, 'tendencia' => 0.0002],
        'Banca'              => ['volatilidad' => 0.3, 'tendencia' => 0.0],
        'Salud'              => ['volatilidad' => 0.35, 'tendencia' => 0.0001],
        'Turismo'            => ['volatilidad' => 0.5, 'tendencia' => 0.0],
        'Automoción'         => ['volatilidad' => 0.45, 'tendencia' => 0.0],
        'Infraestructuras'   => ['volatilidad' => 0.25, 'tendencia' => 0.0],
        'Consumo'            => ['volatilidad' => 0.4, 'tendencia' => 0.0001],
        'Telecomunicaciones' => ['volatilidad' => 0.35, 'tendencia' => 0.0],
        'Inmobiliario'       => ['volatilidad' => 0.35, 'tendencia' => -0.0001],
        'General'            => ['volatilidad' => 0.35, 'tendencia' => 0.0],
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

        // Factor global de mercado
        $indiceMercado = $this->generarVariacionNormal(0, 0.0005);

        // Ciclo de mercado (bull/bear muy suave)
        $faseMercado = (int)(now()->timestamp / 3600) % 4 < 2 ? 0.0002 : -0.0002;

        foreach ($empresas as $empresa) {
            $precioAnterior = $empresa->precio_actual;
            $sector = $empresa->sector ?? 'General';

            $config = $this->comportamientoPorSector[$sector] ?? ['volatilidad' => 0.35, 'tendencia' => 0.0];
            $volatilidad = $config['volatilidad'];
            $tendencia   = $config['tendencia'];

            // Ajuste por horario de mercado
            $hora = now()->hour;
            $volHorario = ($hora >= 9 && $hora <= 17) ? $volatilidad * 1.2 : $volatilidad * 0.5;

            // Volatilidad adaptativa basada en último tick
           $ultimoTick = $empresa->ticks()->latest('registrado_en')->first();

            if ($ultimoTick) {
                $cambio = abs($ultimoTick->cierre - $precioAnterior) / max(0.01, $precioAnterior);
                $volHorario *= 1 + $cambio * 1.5;
            }

            // Variación base
            $variacion = $precioAnterior * $this->generarVariacionNormal(0, $volHorario / 100);

            //Tendencia, índice global y fase de mercado
            $variacion += $precioAnterior * $tendencia;
            $variacion += $precioAnterior * $indiceMercado;
            $variacion += $precioAnterior * $faseMercado;

            // Limitar la variación máxima por tick ±2-3%
            $maxDelta = 0.03 * $precioAnterior;
            $variacion = max(-$maxDelta, min($maxDelta, $variacion));

            // Eventos externos
            if (rand(0,500) < 2) {
                $evento = rand(-1,1);
                $variacion += $precioAnterior * $evento * rand(1,2) / 100; // ±1-2%
            }

            $nuevoPrecio = max(0.01, $precioAnterior + $variacion);
            $empresa->update(['precio_actual' => round($nuevoPrecio, 2)]);

            // Generar tick OHLC con delta relativo al precio
            $apertura = $precioAnterior;
            $cierre   = $empresa->precio_actual;
            $delta = $precioAnterior * 0.005; // ±0.5%
            $maximo = max($apertura, $cierre) + mt_rand(-$delta*100, $delta*100)/100;
            $minimo = min($apertura, $cierre) - mt_rand(-$delta*100, $delta*100)/100;

            Tick::create([
                'empresa_id'    => $empresa->id,
                'apertura'      => round($apertura, 2),
                'maximo'        => max($maximo, $apertura, $cierre),
                'minimo'        => max(0.01, min($minimo, $apertura, $cierre)),
                'cierre'        => round($cierre, 2),
                'registrado_en' => now(),
            ]);
        }

        $this->info('Precios simulados de forma realista: movimientos suaves, ciclos y shocks controlados.');
    }

    private function generarVariacionNormal($media = 0, $desviacion = 1): float
    {
        // Método Box-Muller para aproximar distribución normal
        $u1 = mt_rand() / mt_getrandmax();
        $u2 = mt_rand() / mt_getrandmax();
        return $media + $desviacion * sqrt(-2 * log($u1)) * cos(2 * M_PI * $u2);
    }
}
