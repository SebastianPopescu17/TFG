<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\IndicadorMacro;

class ImportarIndicadoresMacro extends Command
{
    protected $signature = 'indicadores:importar {pais?} {--desde=2010}';
    protected $description = 'Importa indicadores macroeconómicos del Banco Mundial, múltiples países, enriquecidos con EUR y variaciones';

    private array $indicadores = [
        // Economía y crecimiento
        'NY.GDP.MKTP.CD'    => 'PIB (US$ corrientes)',
        'NY.GDP.PCAP.CD'    => 'PIB per cápita (US$ corrientes)',
        'NY.GDP.MKTP.KD.ZG' => 'Crecimiento del PIB (%)',
        'FP.CPI.TOTL.ZG'    => 'Inflación (IPC, %)',
        'NE.GDI.FTOT.ZS'    => 'Formación bruta de capital fijo (% PIB)',
        'NY.GNS.ICTR.ZS'    => 'Ahorro nacional bruto (% PIB)',
        'BN.CAB.XOKA.GD.ZS' => 'Cuenta corriente (% PIB)',

        // Finanzas públicas
        'GC.DOD.TOTL.GD.ZS' => 'Deuda pública (% PIB)',
        'GC.XPN.TOTL.GD.ZS' => 'Gasto del gobierno (% PIB)',
        'GC.BAL.CASH.GD.ZS' => 'Balance fiscal (% PIB)',
        'GC.TAX.TOTL.GD.ZS' => 'Ingresos tributarios (% PIB)',

    ];

    private array $paises = [
    'US' => 'USA',  // Estados Unidos
    'CN' => 'CHN',  // China
    'JP' => 'JPN',  // Japón
    'DE' => 'DEU',  // Alemania
    'IN' => 'IND',  // India
    'GB' => 'GBR',  // Reino Unido
    'FR' => 'FRA',  // Francia
    'IT' => 'ITA',  // Italia
    'CA' => 'CAN',  // Canadá
    'KR' => 'KOR',  // Corea del Sur
    'ES' => 'ESP',  // España
    'TR' => 'TUR',  // Turquía
    'NL' => 'NLD',  // Países Bajos
    'CH' => 'CHE',  // Suiza
    'SE' => 'SWE',  // Suecia
    'AR' => 'ARG',  // Argentina
];


    public function handle()
    {
        $desde = (int) $this->option('desde');
        $paisArg = $this->argument('pais');

        $listaPaises = $paisArg ? $this->filtrarPaisArg($paisArg) : $this->paises;
        $usdToEur = $this->obtenerTipoCambioUsdEur();

        foreach ($listaPaises as $iso2 => $iso3) {
            $this->info("Importando país: {$iso3}");
            foreach ($this->indicadores as $codigo => $nombre) {
                $url = "https://api.worldbank.org/v2/country/{$iso2}/indicator/{$codigo}?format=json&per_page=2000";
                $response = Http::withOptions([
    'verify' => 'C:/xampp/php/extras/ssl/cacert.pem'
])->get($url);


                if (!$response->successful()) {
                    $this->error("Error {$iso3} - {$codigo}");
                    continue;
                }

                $data = $response->json()[1] ?? [];
                foreach ($data as $entry) {
                    $year = (int)($entry['date'] ?? 0);
                    $valor = $entry['value'];

                    if ($year >= $desde && $valor !== null) {
                        $valorUsd = (float)$valor;
                        $valorEur = round($valorUsd * $usdToEur, 2);

                        $prev = IndicadorMacro::where('pais',$iso3)
                            ->where('codigo',$codigo)
                            ->where('anio',$year-1)
                            ->first();

                        $variacion = null;
                        if ($prev && $prev->valor_usd) {
                            $variacion = round((($valorUsd - $prev->valor_usd) / $prev->valor_usd) * 100, 2);
                        }

                        IndicadorMacro::updateOrCreate(
                            ['pais'=>$iso3,'codigo'=>$codigo,'anio'=>$year],
                            [
                                'nombre'=>$nombre,
                                'unidad'=>$entry['indicator']['value'] ?? '',
                                'valor'=>$valorUsd,
                                'valor_usd'=>$valorUsd,
                                'valor_eur'=>$valorEur,
                                'variacion'=>$variacion,
                                'fecha'=>"$year-01-01",
                            ]
                        );
                    }
                }
                $this->info("OK {$iso3} - {$codigo}");
            }
        }
        $this->info('Importación completada.');
    }

    private function filtrarPaisArg(string $paisArg): array
    {
        $paisArg = strtoupper($paisArg);
        foreach ($this->paises as $iso2 => $iso3) {
            if ($paisArg === $iso2 || $paisArg === $iso3) {
                return [$iso2 => $iso3];
            }
        }
        return ['ES'=>'ESP'];
    }

    private function obtenerTipoCambioUsdEur(): float
    {
        try {
            $resp = Http::get('https://api.exchangerate.host/latest?base=USD&symbols=EUR');
            if ($resp->successful()) {
                return (float)($resp->json()['rates']['EUR'] ?? 0.9);
            }
        } catch (\Throwable $e) {}
        return 0.9;
    }
}
