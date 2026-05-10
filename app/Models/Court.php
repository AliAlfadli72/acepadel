<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Court extends Model
{
        use SoftDeletes;

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
