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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title_ar');
            $table->string('title_en');
            $table->text('desc_ar');
            $table->text('desc_en');
            $table->enum('category', ['Tournament', 'Cup', 'Event'])->default('Event');
            $table->enum('level', ['Open', 'Advanced', 'All Levels', 'Juniors'])->default('Open');
            $table->date('date');
            $table->time('time');
            $table->decimal('fee', 10, 2)->default(0); // 0 means free
            $table->string('prize_ar')->nullable();
            $table->string('prize_en')->nullable();
            $table->integer('max_participants')->default(0); // 0 means unlimited
            $table->string('color_class')->default('bg-primary text-white');
            $table->string('image_path')->nullable();
            $table->enum('status', ['upcoming', 'ongoing', 'completed'])->default('upcoming');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
