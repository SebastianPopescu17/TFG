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
        Schema::create('empresas', function (Blueprint $table) {
            $table->id();
            $table->string('ticker', 10)->unique();
            $table->string('nombre', 150);
            $table->string('sector', 100)->nullable();
            $table->string('industria', 100)->nullable();
            $table->string('pais', 100)->nullable();
            $table->string('capitalizacion', 50)->nullable();
            $table->decimal('per', 10, 2)->nullable();
            $table->decimal('dividendo', 5, 2)->nullable();
            $table->decimal('precio_actual', 10, 2)->nullable();
            $table->string('moneda', 10)->default('EUR');
            $table->string('sitio_web', 255)->nullable();
            $table->text('descripcion')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empresas');
    }
};
