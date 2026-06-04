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
        Schema::create('pilates_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('coach_name');
            $table->integer('capacity');
            $table->decimal('price_per_session', 10, 2);
            $table->date('session_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('status', [
                'active',
                'canceled',
                'completed'
            ])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pilates_sessions');
    }
};
