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
        Schema::create('indicadores_macro', function (Blueprint $table) {
            $table->id();

            // Identificación del indicador
            $table->string('pais', 3);
            $table->string('codigo', 50);
            $table->string('nombre', 150);

            // Valores
            $table->decimal('valor', 20, 2)->nullable();
            $table->decimal('valor_usd', 20, 2)->nullable();
            $table->decimal('valor_eur', 20, 2)->nullable();
            $table->decimal('variacion', 8, 2)->nullable();

            // Metadatos
            $table->string('unidad', 255)->nullable();
            $table->year('anio');
            $table->date('fecha')->nullable();

            $table->timestamps();

            // Índices para consultas rápidas
            $table->index(['pais', 'codigo', 'anio']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('indicadores_macro');
    }
};
