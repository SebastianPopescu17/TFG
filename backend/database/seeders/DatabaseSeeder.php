<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $this->call([
            EmpresaSeeder::class,
            PrecioHistoricoSeeder::class,
            IndicadorFinancieroSeeder::class,
            IndicadorMacroSeeder::class,
            UserSeeder::class,
            AdminUserSeeder::class, 
        ]);
    }

}
