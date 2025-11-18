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
    Schema::create('noticias', function (Blueprint $table) {
        $table->id();
        $table->foreignId('empresa_id')->nullable()->constrained('empresas')->onDelete('set null');
        $table->string('titulo', 255);
        $table->text('contenido')->nullable();
        $table->string('enlace', 255)->nullable();
        $table->string('fuente', 100)->nullable();
        $table->date('fecha_publicacion')->nullable();
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('noticias');
    }
};
