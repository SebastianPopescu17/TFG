<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Noticia;
use App\Models\Empresa;
use Carbon\Carbon;

class NoticiaSeeder extends Seeder
{
    public function run(): void
    {
        $fuentes = ['Bloomberg', 'Reuters', 'Expansión', 'El País Economía', 'Financial Times'];
        $empresas = Empresa::all();

        foreach ($empresas as $empresa) {
            for ($i = 0; $i < 5; $i++) {
                $n = $i + 1; // número de evento legible

                Noticia::create([
                    'empresa_id' => $empresa->id,
                    'titulo' => "Última novedad sobre {$empresa->nombre} - Evento " . $n,
                    'contenido' => "Resumen de la noticia " . $n . " relacionada con {$empresa->nombre}, destacando un hecho relevante para los inversores y el sector en el que opera.",
                    'enlace' => "https://www.ejemplo.com/noticia-{$empresa->ticker}-{$i}",
                    'fuente' => $fuentes[array_rand($fuentes)],
                    'fecha_publicacion' => Carbon::today()->subDays(mt_rand(1, 60)),
                ]);
            }
        }
    }
}
