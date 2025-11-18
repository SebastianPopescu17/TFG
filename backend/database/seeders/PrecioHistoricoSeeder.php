<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Empresa;
use App\Models\PrecioHistorico;
use Carbon\Carbon;

class PrecioHistoricoSeeder extends Seeder
{
    public function run(): void
    {
        $empresas = Empresa::all();

        foreach ($empresas as $empresa) {
            $precio = $empresa->precio_actual ?? 10;

            // 1 año de datos hábiles
            for ($i = 365; $i >= 0; $i--) {
                $fecha = Carbon::today()->subDays($i);

                if ($fecha->isWeekend()) continue; // saltar sábados y domingos

                $gap = mt_rand(-80, 80) / 100;
                $apertura = max(0.01, round($precio + $gap, 2));
                $range = mt_rand(10, 120) / 100;
                $maximo = round($apertura + $range / 2, 2);
                $minimo = max(0.01, round($apertura - $range / 2, 2));
                $cierre = round($minimo + (mt_rand() / mt_getrandmax()) * ($maximo - $minimo), 2);

                $volumen = (int) (mt_rand(200000, 15000000) * (1 + abs($gap)));

                PrecioHistorico::updateOrCreate(
                    ['empresa_id' => $empresa->id, 'fecha' => $fecha->toDateString()],
                    [
                        'apertura' => $apertura,
                        'maximo' => $maximo,
                        'minimo' => $minimo,
                        'cierre' => $cierre,
                        'volumen' => $volumen
                    ]
                );

                // tendencia ligera
                $tendencia = mt_rand(-5, 5) / 1000;
                $precio = $cierre * (1 + $tendencia);
            }
        }
    }
}
