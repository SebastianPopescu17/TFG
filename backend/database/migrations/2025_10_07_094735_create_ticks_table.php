<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ticks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained()->onDelete('cascade');
            $table->decimal('apertura', 10, 2);
            $table->decimal('maximo', 10, 2);
            $table->decimal('minimo', 10, 2);
            $table->decimal('cierre', 10, 2);
            $table->timestamp('registrado_en')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticks');
    }
};
