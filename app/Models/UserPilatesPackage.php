<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserPilatesPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'pilates_package_id',
        'remaining_classes',
        'expires_at',
    ];

    protected $casts = [
        'remaining_classes' => 'integer',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the user who owns this package subscription.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the Pilates package details.
     */
    public function pilatesPackage(): BelongsTo
    {
        return $this->belongsTo(PilatesPackage::class);
    }

    /**
     * Get bookings made using this package purchase.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(PilatesBooking::class, 'user_pilates_package_id');
    }

    /**
     * Scope a query to only include active packages (has remaining classes and is not expired).
     */
    public function scopeActive($query)
    {
        return $query->where('remaining_classes', '>', 0)
                     ->where('expires_at', '>=', now());
    }
}
