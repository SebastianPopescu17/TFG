<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
    Schema::create('precios_historicos', function (Blueprint $table) {
        $table->id();
        $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
        $table->date('fecha');
        $table->decimal('apertura', 10, 2)->nullable();
        $table->decimal('maximo', 10, 2)->nullable();
        $table->decimal('minimo', 10, 2)->nullable();
        $table->decimal('cierre', 10, 2)->nullable();
        $table->unsignedBigInteger('volumen')->nullable();
        $table->timestamps();
        $table->unique(['empresa_id', 'fecha']);
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('precios_historicos');
    }
};
