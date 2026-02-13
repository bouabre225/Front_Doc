<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('paiements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('commande_id')->constrained('commandes');
            $table->decimal('montant', 10, 2)->nullable();
            $table->string('provider_reference')->nullable();
            $table->timestamp('date_paiement')->nullable();
        });
        
        DB::statement('ALTER TABLE paiements ADD COLUMN moyen moyen_paiement_enum');
        DB::statement('ALTER TABLE paiements ADD COLUMN statut statut_paiement_enum');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};
