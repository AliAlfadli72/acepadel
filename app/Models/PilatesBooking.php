<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PilatesBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'pilates_session_id',
        'status', // pending, confirmed, canceled
        'paid_amount',
        'payment_method', // wallet, cash
    ];

    protected $casts = [
        'paid_amount' => 'decimal:2',
    ];

    /**
     * Get the user who made the booking.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the Pilates session booked.
     */
    public function pilatesSession(): BelongsTo
    {
        return $this->belongsTo(PilatesSession::class);
    }
}
