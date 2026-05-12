<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Transaction extends Model
{
    protected $fillable = [
        'wallet_id',

        // Financial
        'amount',
        'type',
        'payment_method',
        'status',

        // Ledger tracking
        'balance_before',
        'balance_after',

        // Reference system
        'reference_type',
        'reference_id',

        // Metadata
        'description',
        'notes',

        // Audit
        'processed_at',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'processed_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Related model
     * Example:
     * - Booking
     * - WalletTopup
     * - Event
     */
    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isDeposit(): bool
    {
        return in_array($this->type, [
            'deposit',
            'refund',
            'bonus',
        ]);
    }

    public function isDeduction(): bool
    {
        return in_array($this->type, [
            'booking_payment',
            'manual_deduction',
            'penalty',
        ]);
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}