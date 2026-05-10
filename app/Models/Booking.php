<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'guest_name',
        'guest_phone',
        'court_id',
        'coach_profile_id',
        'start_time',
        'end_time',
        'status',
        'total_price',
        'payment_status',
        'payment_method',
        'paid_amount',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
        ];
    }

    protected function serializeDate(\DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i:s');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function court()
    {
        return $this->belongsTo(Court::class);
    }

    public function coachProfile()
    {
        return $this->belongsTo(CoachProfile::class);
    }
}
