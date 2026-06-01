<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PilatesSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'coach_id',
        'session_type',
        'capacity',
        'price_per_session',
        'session_date',
        'start_time',
        'end_time',
        'status', // active, canceled
    ];

    protected $casts = [
        'capacity' => 'integer',
        'price_per_session' => 'decimal:2',
        'session_date' => 'date:Y-m-d',
        'coach_id' => 'integer',
    ];

    protected $appends = ['coach_name'];

    /**
     * Get the coach's name as a virtual attribute for mobile app backward compatibility.
     */
    public function getCoachNameAttribute(): string
    {
        return $this->coach ? $this->coach->name : '';
    }

    /**
     * Get the coach associated with the session.
     */
    public function coach(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    /**
     * Get bookings associated with the session.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(PilatesBooking::class);
    }

    /**
     * Calculate and return available slots left for booking.
     * Capacity minus active bookings (confirmed and pending) count.
     */
    public function getAvailableSlotsAttribute(): int
    {
        $activeBookingsCount = $this->bookings()
            ->whereIn('status', ['confirmed', 'pending'])
            ->count();

        return max(0, $this->capacity - $activeBookingsCount);
    }
}
