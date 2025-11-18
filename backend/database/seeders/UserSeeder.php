<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Usuario Demo',
            'email' => 'demo@investrack.local',
            'password' => Hash::make('password')
        ]);

        // Si quieres más usuarios de prueba:
        for ($i = 1; $i <= 5; $i++) {
            User::create([
                'name' => "Usuario {$i}",
                'email' => "usuario{$i}@investrack.local",
                'password' => Hash::make('123456')
            ]);
        }
    }
}
