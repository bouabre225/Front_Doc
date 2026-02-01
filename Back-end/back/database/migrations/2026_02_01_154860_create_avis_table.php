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
        Schema::create('avis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('commande_id')->constrained('commandes');
            $table->foreignId('vendeur_id')->constrained('users');
            $table->integer('note_vendeur')->nullable();
            $table->integer('note_conformite')->nullable();
            $table->text('commentaire')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
        
        DB::statement('ALTER TABLE avis ADD CONSTRAINT check_note_vendeur CHECK (note_vendeur BETWEEN 1 AND 5)');
        DB::statement('ALTER TABLE avis ADD CONSTRAINT check_note_conformite CHECK (note_conformite BETWEEN 1 AND 5)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('avis');
    }
};
