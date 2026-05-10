<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CoachProfile extends Model
{
     use SoftDeletes;
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
    }

    protected static function booted()
{
    static::deleting(function ($coach) {

        $hasFutureBookings = $coach->bookings()
            ->where('start_time', '>', now())
            ->whereIn('status', [
                'pending',
                'approved'
            ])
            ->exists();

        if ($hasFutureBookings) {

            throw new \Exception(
                'لا يمكن حذف المدرب لوجود جلسات مستقبلية.'
            );
        }
    });
}
    
    
}
