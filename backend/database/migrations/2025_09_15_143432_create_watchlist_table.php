<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('watchlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->timestamp('fecha_agregado')->useCurrent();
            $table->unique(['user_id','empresa_id']);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('watchlists');
    }
};

