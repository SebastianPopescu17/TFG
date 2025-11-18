<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('operaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->enum('tipo', ['compra', 'venta']);
            $table->decimal('cantidad', 18, 6);
            $table->decimal('precio', 18, 6);
            $table->decimal('plusvalia', 18, 6)->nullable();
            $table->timestamps();
            $table->index(['user_id','empresa_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('operaciones');
    }
};
