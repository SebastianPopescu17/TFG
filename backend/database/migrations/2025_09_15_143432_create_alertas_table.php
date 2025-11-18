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
    Schema::create('alertas', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('empresa_id')->constrained()->onDelete('cascade');
    $table->enum('tipo', ['precio', 'noticia', 'otro']);
    $table->enum('condicion', ['mayor', 'menor', 'igual']);
    $table->decimal('valor', 12, 2);
    $table->boolean('activa')->default(true);
    $table->timestamps();

    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
});

}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alertas');
    }
};
