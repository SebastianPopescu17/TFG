<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Empresa;
use App\Models\IndicadorFinanciero;
use Carbon\Carbon;

class IndicadorFinancieroSeeder extends Seeder
{
    public function run(): void
    {
        $empresas = Empresa::all();

        foreach ($empresas as $empresa) {
            for ($q = 0; $q < 8; $q++) {
                $fecha = Carbon::now()->startOfQuarter()->subQuarters($q);

                IndicadorFinanciero::updateOrCreate(
                    ['empresa_id' => $empresa->id, 'fecha' => $fecha->toDateString()],
                    [
                        'roe' => round(mt_rand(500, 3000) / 100, 2),
                        'roa' => round(mt_rand(200, 1800) / 100, 2),
                        'margen_beneficio' => round(mt_rand(500, 4500) / 100, 2),
                        'deuda_capital' => round(mt_rand(500, 12000) / 100, 2),
                        'ingresos' => mt_rand(1000000000, 50000000000),
                        'beneficio_neto' => mt_rand(50000000, 5000000000),
                        'eps' => round(mt_rand(50, 500) / 100, 2),
                    ]
                );
            }
        }
    }
}
