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
        Schema::table('wallets', function (Blueprint $table) {
            $table->decimal('pilates_balance', 10, 2)->default(0.00)->after('balance');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->string('studio')->default('padel')->after('amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wallets', function (Blueprint $table) {
            $table->dropColumn('pilates_balance');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('studio');
        });
    }
};
