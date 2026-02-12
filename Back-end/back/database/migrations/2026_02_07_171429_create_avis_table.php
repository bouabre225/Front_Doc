<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
  public function up()
{
    Schema::create('avis', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('annonce_id')->constrained()->onDelete('cascade');
        $table->integer('note')->unsigned()->default(5); // 1-5 étoiles
        $table->text('commentaire')->nullable();
        $table->timestamps();
        
        // Un user ne peut laisser qu'un seul avis par annonce
        $table->unique(['user_id', 'annonce_id']);
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('avis');
    }
};
