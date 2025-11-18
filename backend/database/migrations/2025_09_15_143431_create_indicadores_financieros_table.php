<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('indicadores_financieros', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->date('fecha');
            $table->decimal('roe', 6, 2)->nullable();
            $table->decimal('roa', 6, 2)->nullable();
            $table->decimal('margen_beneficio', 6, 2)->nullable();
            $table->decimal('deuda_capital', 6, 2)->nullable();
            $table->bigInteger('ingresos')->nullable();
            $table->bigInteger('beneficio_neto')->nullable();
            $table->decimal('eps', 8, 2)->nullable();
            $table->timestamps();
            $table->unique(['empresa_id','fecha']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('indicadores_financieros');
    }
};
