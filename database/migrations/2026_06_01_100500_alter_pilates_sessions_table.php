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
        Schema::table('pilates_sessions', function (Blueprint $table) {
            $table->enum('session_type', ['indoor', 'outdoor'])->default('indoor')->after('price_per_session');
            $table->foreignId('coach_id')->nullable()->after('description')->constrained('users')->onDelete('set null');
            $table->dropColumn('coach_name');
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pilates_sessions', function (Blueprint $table) {
            $table->string('coach_name')->after('description');
            $table->dropForeign(['coach_id']);
            $table->dropColumn(['coach_id', 'session_type']);
        });
    }
};
