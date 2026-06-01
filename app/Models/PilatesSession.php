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
        'coach_name',
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
        'session_date' => 'date',
    ];

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
