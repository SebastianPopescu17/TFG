<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('indicadores:importar --desde=2000')
    ->weeklyOn(1, '03:00');

Schedule::command('indicadores:importar ES --desde=2000')
    ->dailyAt('04:00');

Schedule::command('simular:precios')
    ->everyMinute();
