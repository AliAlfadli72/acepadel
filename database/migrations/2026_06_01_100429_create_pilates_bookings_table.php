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
        Schema::create('pilates_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('pilates_session_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['pending', 'confirmed', 'canceled'])->default('pending');
            $table->decimal('paid_amount', 10, 2)->default(0.00);
            $table->enum('payment_method', ['wallet', 'cash']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pilates_bookings');
    }
};
