<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ordenes_programadas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->enum('tipo', ['compra', 'venta']);
            $table->bigInteger('cantidad')->unsigned();
            $table->decimal('precio_objetivo', 18, 2)->nullable();
            $table->enum('estado', ['pendiente', 'cancelada', 'cumplida'])->default('pendiente');
            $table->dateTime('scheduled_at')->nullable();
            $table->bigInteger('cantidad_ejecutada')->unsigned()->nullable();
            $table->text('motivo_cancelacion')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'empresa_id', 'estado']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ordenes_programadas');
    }
};
