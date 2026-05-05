<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Court extends Model
{
    protected $fillable = [
        'name',
        'type',
        'image_path',
        'price',
        'description',
        'is_active',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function coaches()
    {
        return $this->belongsToMany(CoachProfile::class, 'coach_court');
    }
}
