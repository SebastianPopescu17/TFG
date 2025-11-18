<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\IndicadorMacro;

class ImportarIndicadoresMacro extends Command
{
    protected $signature = 'indicadores:importar {pais?} {--desde=2000}';
    protected $description = 'Importa indicadores macroeconómicos del Banco Mundial, múltiples países, enriquecidos con EUR y variaciones';

    private array $indicadores = [
        // Economía y crecimiento
        'NY.GDP.MKTP.CD'    => 'PIB (US$ corrientes)',
        'NY.GDP.PCAP.CD'    => 'PIB per cápita (US$ corrientes)',
        'NY.GDP.MKTP.KD.ZG' => 'Crecimiento del PIB (%)',
        'FP.CPI.TOTL.ZG'    => 'Inflación (IPC, %)',
        'NE.EXP.GNFS.ZS'    => 'Exportaciones (% PIB)',
        'NE.IMP.GNFS.ZS'    => 'Importaciones (% PIB)',
        'NE.GDI.FTOT.ZS'    => 'Formación bruta de capital fijo (% PIB)',
        'NY.GNS.ICTR.ZS'    => 'Ahorro nacional bruto (% PIB)',
        'BN.CAB.XOKA.GD.ZS' => 'Cuenta corriente (% PIB)',

        // Finanzas públicas
        'GC.DOD.TOTL.GD.ZS' => 'Deuda pública (% PIB)',
        'GC.REV.XGRT.GD.ZS' => 'Ingresos del gobierno (% PIB)',
        'GC.XPN.TOTL.GD.ZS' => 'Gasto del gobierno (% PIB)',
        'GC.BAL.CASH.GD.ZS' => 'Balance fiscal (% PIB)',
        'GC.TAX.TOTL.GD.ZS' => 'Ingresos tributarios (% PIB)',
        'GC.XPN.INTP.RV.ZS' => 'Gasto en intereses (% ingresos)',

        // Extras
        'SE.XPD.TOTL.GD.ZS' => 'Gasto en educación (% PIB)',
        'SH.XPD.CHEX.GD.ZS' => 'Gasto en salud (% PIB)',
        'FI.RES.TOTL.CD'    => 'Reservas internacionales (US$)',
        'SL.UEM.TOTL.ZS'    => 'Desempleo total (% población activa)',
        'SP.POP.TOTL'       => 'Población total',
    ];

    private array $paises = [
        'US'=>'USA','CN'=>'CHN','JP'=>'JPN','DE'=>'DEU','IN'=>'IND','GB'=>'GBR','FR'=>'FRA','IT'=>'ITA','CA'=>'CAN',
        'KR'=>'KOR','RU'=>'RUS','BR'=>'BRA','AU'=>'AUS','ES'=>'ESP','MX'=>'MEX','ID'=>'IDN','TR'=>'TUR','NL'=>'NLD',
        'SA'=>'SAU','CH'=>'CHE','SE'=>'SWE','PL'=>'POL','BE'=>'BEL','TH'=>'THA','AR'=>'ARG','NG'=>'NGA','AT'=>'AUT',
        'AE'=>'ARE','NO'=>'NOR','IE'=>'IRL','IL'=>'ISR','MY'=>'MYS','PH'=>'PHL','CO'=>'COL','ZA'=>'ZAF','EG'=>'EGY',
        'DK'=>'DNK','RO'=>'ROU','CZ'=>'CZE','PT'=>'PRT','GR'=>'GRC','HU'=>'HUN','PK'=>'PAK','VN'=>'VNM','BD'=>'BGD',
        'CL'=>'CHL','PE'=>'PER','QA'=>'QAT','KW'=>'KWT','NZ'=>'NZL',
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
                $response = Http::get($url);

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
