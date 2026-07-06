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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->string('reportable_type', 20); // post | comment
            $table->unsignedBigInteger('reportable_id');
            $table->string('reason'); // spam | inappropriate | harassment | hate_speech | violence | other
            $table->text('description')->nullable();
            $table->string('status')->default('pending'); // pending | dismissed | removed
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            // Um utilizador só pode denunciar o mesmo conteúdo uma vez
            $table->unique(['reporter_id', 'reportable_type', 'reportable_id'], 'unique_report_per_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
