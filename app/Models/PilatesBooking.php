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
        'user_pilates_package_id',
        'status', // pending, confirmed, canceled
        'paid_amount',
        'payment_method', // wallet, cash, package
    ];

    protected $casts = [
        'paid_amount' => 'decimal:2',
        'user_pilates_package_id' => 'integer',
    ];

    /**
     * Get the package subscription used for this booking, if any.
     */
    public function userPilatesPackage(): BelongsTo
    {
        return $this->belongsTo(UserPilatesPackage::class, 'user_pilates_package_id');
    }

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
