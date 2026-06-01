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
        Schema::table('pilates_bookings', function (Blueprint $table) {
            // Re-define payment_method to allow package
            $table->string('payment_method')->default('wallet')->change();
            
            // Add relation to track which user package subscription was used
            $table->foreignId('user_pilates_package_id')
                ->nullable()
                ->after('pilates_session_id')
                ->constrained('user_pilates_packages')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pilates_bookings', function (Blueprint $table) {
            $table->dropForeign(['user_pilates_package_id']);
            $table->dropColumn('user_pilates_package_id');
            // Revert column change if possible, but keep string to avoid driver issues
        });
    }
};
