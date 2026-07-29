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
        // 1. Tournaments Table
        Schema::create('tournaments', function (Blueprint $table) {
            $table->id();
            $table->string('title_ar');
            $table->string('title_en');
            $table->text('desc_ar')->nullable();
            $table->text('desc_en')->nullable();
            $table->string('location_ar')->default('Ace Padel Club');
            $table->string('location_en')->default('Ace Padel Club');
            $table->string('prize_pool')->nullable(); // e.g. "40,000,000 SYP"
            $table->date('start_date');
            $table->date('end_date');
            $table->string('banner_image')->nullable();
            $table->enum('status', ['draft', 'upcoming', 'ongoing', 'completed'])->default('upcoming');
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Tournament Categories Table
        Schema::create('tournament_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained('tournaments')->onDelete('cascade');
            $table->string('name'); // e.g. "Category B", "Category C"
            $table->integer('max_teams')->default(16);
            $table->decimal('fee', 10, 2)->default(0.00);
            $table->enum('format', ['knockout', 'group_stage', 'hybrid'])->default('knockout');
            $table->timestamps();
        });

        // 3. Tournament Teams Table
        Schema::create('tournament_teams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_category_id')->constrained('tournament_categories')->onDelete('cascade');
            $table->string('team_name'); // e.g. "Rami + Mazhar"
            $table->foreignId('player1_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('player2_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('player2_name')->nullable(); // Guest fallback if player 2 isn't registered
            $table->integer('seed')->nullable(); // Seed / Rank for draw positioning
            $table->enum('status', ['pending', 'confirmed', 'eliminated'])->default('confirmed');
            $table->timestamps();
        });

        // 4. Tournament Matches Table (Nodes in Bracket Tree)
        Schema::create('tournament_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_category_id')->constrained('tournament_categories')->onDelete('cascade');
            $table->integer('round'); // 16 = Round of 16, 8 = Quarter, 4 = Semi, 2 = Final
            $table->integer('match_number'); // Order in round (1..N)
            
            // Bracket progression links
            $table->foreignId('next_match_id')->nullable()->constrained('tournament_matches')->onDelete('set null');
            $table->enum('next_match_slot', ['team1', 'team2'])->nullable();
            
            // Teams competing
            $table->foreignId('team1_id')->nullable()->constrained('tournament_teams')->onDelete('set null');
            $table->foreignId('team2_id')->nullable()->constrained('tournament_teams')->onDelete('set null');
            $table->foreignId('winner_id')->nullable()->constrained('tournament_teams')->onDelete('set null');
            
            // Match Details
            $table->foreignId('court_id')->nullable()->constrained('courts')->onDelete('set null');
            $table->date('scheduled_date')->nullable();
            $table->string('scheduled_time')->nullable(); // e.g. "17:30"
            $table->string('score_team1')->nullable(); // e.g. "6 6"
            $table->string('score_team2')->nullable(); // e.g. "4 3"
            $table->enum('status', ['scheduled', 'live', 'completed', 'cancelled'])->default('scheduled');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tournament_matches');
        Schema::dropIfExists('tournament_teams');
        Schema::dropIfExists('tournament_categories');
        Schema::dropIfExists('tournaments');
    }
};
