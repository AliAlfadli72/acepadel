<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CoachProfile extends Model
{
    protected $fillable = [
        'user_id',
        'bio',
        'specialty',
        'hourly_rate',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function availabilities()
    {
        return $this->hasMany(CoachAvailability::class);
    }

    public function courts()
    {
        return $this->belongsToMany(Court::class, 'coach_court');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }}
