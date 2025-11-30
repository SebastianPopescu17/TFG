<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
   public function run(): void
{
    User::firstOrCreate(
        ['email' => 'demo@investrack.local'],
        [
            'name' => 'Usuario Demo',
            'password' => Hash::make('password')
        ]
    );

    for ($i = 1; $i <= 2; $i++) {
        User::firstOrCreate(
            ['email' => "usuario{$i}@investrack.local"],
            [
                'name' => "Usuario {$i}",
                'password' => Hash::make('123456')
            ]
        );
    }
}

}
