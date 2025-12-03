<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('posiciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->decimal('cantidad', 18, 2)->default(0);
            $table->decimal('invertido', 18, 2)->default(0);
            $table->decimal('precio_medio', 18, 2)->default(0);
            $table->timestamps();
            $table->unique(['user_id','empresa_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('posiciones');
    }
};

