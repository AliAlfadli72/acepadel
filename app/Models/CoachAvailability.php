<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CoachAvailability extends Model
{
    protected $fillable = [
        'coach_profile_id',
        'day_of_week',
        'start_time',
        'end_time',
    ];

    public function coachProfile()
    {
        return $this->belongsTo(CoachProfile::class);
    }}
