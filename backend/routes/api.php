<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\CalculadoraController;
use App\Http\Controllers\CarteraController;
use App\Http\Controllers\IndicadorMacroController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\WatchlistController;
use App\Http\Controllers\AlertaController;
use App\Http\Controllers\TickController;
use App\Http\Controllers\PrecioController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Rutas públicas (sin autenticación)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

/*
|--------------------------------------------------------------------------
| Rutas protegidas (requieren auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Perfil y autenticación
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | Empresas
    |--------------------------------------------------------------------------
    */
    Route::prefix('empresas')->group(function () {
        Route::get('/', [EmpresaController::class, 'index']);
        Route::get('/{ticker}', [EmpresaController::class, 'show']);
        Route::get('/{ticker}/historico', [EmpresaController::class, 'historico']);
        Route::get('/{ticker}/grafica', [EmpresaController::class, 'grafica']);
        Route::get('/{id}/ticks', [EmpresaController::class, 'ticks']);
        Route::get('/{id}/indicadores', [EmpresaController::class, 'indicadores']);
        Route::get('/{id}/noticias', [EmpresaController::class, 'noticias']);
        Route::get('/{empresa}/ticks', [TickController::class, 'ultimos']);
        Route::post('/{id}/precio', [PrecioController::class, 'store']);
    });

    Route::get('/precios/ultimos', [PrecioController::class, 'ultimos']);

    /*
    |--------------------------------------------------------------------------
    | Indicadores y noticias
    |--------------------------------------------------------------------------
    */
    Route::prefix('indicadores')->group(function () {
        Route::get('/', [IndicadorMacroController::class, 'index']);
        Route::get('/series', [IndicadorMacroController::class, 'series']);
        Route::get('/kpi', [IndicadorMacroController::class, 'kpi']);
        Route::get('/compare', [IndicadorMacroController::class, 'compare']);
        Route::get('/paises', [IndicadorMacroController::class, 'paises']);

    });
    Route::get('/indicadores/disponibles', [IndicadorMacroController::class, 'disponibles']);


    /*
    |--------------------------------------------------------------------------
    | Calculadora
    |--------------------------------------------------------------------------
    */
    Route::post('/calculadora/rentabilidad', [CalculadoraController::class, 'rentabilidad']);

    /*
    |--------------------------------------------------------------------------
    | Cartera
    |--------------------------------------------------------------------------
    */
    Route::prefix('cartera')->group(function () {
        Route::post('/simular', [CarteraController::class, 'simular']);
        Route::post('/comprar', [CarteraController::class, 'comprar']);
        Route::post('/vender', [CarteraController::class, 'vender']);
        Route::get('/', [CarteraController::class, 'cartera']);
        Route::get('/operaciones', [CarteraController::class, 'operaciones']);
        Route::get('/posiciones/{empresaId}', [CarteraController::class, 'posicion']);
    });

    /*
    |--------------------------------------------------------------------------
    | Saldo
    |--------------------------------------------------------------------------
    */
    Route::prefix('saldo')->group(function () {
        Route::get('/', [CarteraController::class, 'saldo']);
        Route::post('/ingresar', [CarteraController::class, 'ingresar']);
        Route::post('/retirar', [CarteraController::class, 'retirar']);
        Route::get('/movimientos', [CarteraController::class, 'movimientosSaldo']);
    });

    /*
    |--------------------------------------------------------------------------
    | Watchlist
    |--------------------------------------------------------------------------
    */
    Route::prefix('users/{id}/watchlist')->group(function () {
        Route::get('/', [WatchlistController::class, 'index']);
        Route::post('/', [WatchlistController::class, 'store']);
        Route::delete('/{empresa}', [WatchlistController::class, 'destroy']);
    });

    /*
    |--------------------------------------------------------------------------
    | Alertas
    |--------------------------------------------------------------------------
    */
    Route::prefix('users/{id}/alertas')->group(function () {
        Route::get('/', [AlertaController::class, 'index']);
        Route::post('/', [AlertaController::class, 'store']);
        Route::delete('/{alertaId}', [AlertaController::class, 'destroy']);
        Route::patch('/{alertaId}', [AlertaController::class, 'update']);

    });

    /*
|--------------------------------------------------------------------------
| Verificación de email (no usada actualmente)
|--------------------------------------------------------------------------
*/
// Route::get('/email/verify', function (Request $request) {
//     return $request->user()->hasVerifiedEmail()
//         ? response()->json(['verified' => true])
//         : response()->json(['verified' => false]);
// });

// Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
//     $request->fulfill();
//     return response()->json(['message' => 'Email verificado correctamente']);
// })->middleware(['signed'])->name('verification.verify');

// Route::post('/email/verification-notification', function (Request $request) {
//     $request->user()->sendEmailVerificationNotification();
//     return response()->json(['message' => 'Correo de verificación enviado']);
// })->middleware(['throttle:6,1'])->name('verification.send');


    /*
    |--------------------------------------------------------------------------
    | Admin
    |--------------------------------------------------------------------------
    */
    Route::middleware('admin')->group(function () {
        Route::get('/admin/dashboard', [AdminController::class, 'index']);
    });
});
