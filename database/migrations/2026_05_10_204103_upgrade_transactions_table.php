<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {

            // Status
            $table->string('status')
                ->default('completed')
                ->after('type');

            // Ledger
            $table->decimal('balance_before', 10, 2)
                ->default(0)
                ->after('status');

            $table->decimal('balance_after', 10, 2)
                ->default(0)
                ->after('balance_before');

            // Polymorphic reference
            $table->nullableMorphs('reference');

            // Extra metadata
            $table->text('notes')->nullable();

            $table->timestamp('processed_at')
                ->nullable()
                ->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {

            $table->dropColumn([
                'status',
                'balance_before',
                'balance_after',
                'notes',
                'processed_at',
            ]);

            $table->dropMorphs('reference');
        });
    }
};