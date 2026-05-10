<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Exception;

class WalletService
{
    
    /*
    |--------------------------------------------------------------------------
    | Deposit
    |--------------------------------------------------------------------------
    */

    public function deposit(
        Wallet $wallet,
        float $amount,
        string $description,
        ?int $createdBy = null,
        $reference = null
    ): Transaction {

        if ($amount <= 0) {
            throw new Exception('Deposit amount must be greater than zero.');
        }

        return DB::transaction(function () use (
            $wallet,
            $amount,
            $description,
            $createdBy,
            $reference
        ) {

            $before = $wallet->balance;

            // Update balance first
            $wallet->increment('balance', $amount);

            $wallet->refresh();

            return $wallet->transactions()->create([
                'amount' => $amount,

                'type' => 'deposit',

                'status' => 'completed',

                'balance_before' => $before,
                'balance_after' => $wallet->balance,

                'description' => $description,

                'reference_type' => $reference ? get_class($reference) : null,
                'reference_id' => $reference?->id,

                'processed_at' => now(),

                'created_by' => $createdBy,
            ]);
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Booking Payment
    |--------------------------------------------------------------------------
    */

    public function bookingPayment(
        Wallet $wallet,
        Booking $booking,
        float $amount,
        string $description,
        ?int $createdBy = null
    ): Transaction {

        if ($amount <= 0) {
            throw new Exception('Payment amount must be greater than zero.');
        }

        if ($wallet->balance < $amount) {
            throw new Exception('رصيد اللاعب غير كافٍ لإكمال الحجز.');
        }

        return DB::transaction(function () use (
            $wallet,
            $booking,
            $amount,
            $description,
            $createdBy
        ) {

            $before = $wallet->balance;

            // Deduct balance
            $wallet->decrement('balance', $amount);

            $wallet->refresh();

            return $wallet->transactions()->create([
                'amount' => $amount,

                'type' => 'booking_payment',

                'status' => 'completed',

                'balance_before' => $before,
                'balance_after' => $wallet->balance,

                'description' => $description,

                'reference_type' => Booking::class,
                'reference_id' => $booking->id,

                'processed_at' => now(),

                'created_by' => $createdBy,
            ]);
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Refund
    |--------------------------------------------------------------------------
    */
    public function manualAdjustment(
    Wallet $wallet,
    float $amount,
    string $description,
    ?int $createdBy = null
): Transaction {

    if ($amount <= 0) {
        throw new Exception('Adjustment amount must be greater than zero.');
    }

    if ($wallet->balance < $amount) {
        throw new Exception('رصيد المحفظة غير كافٍ.');
    }

    return DB::transaction(function () use (
        $wallet,
        $amount,
        $description,
        $createdBy
    ) {

        $before = $wallet->balance;

        $wallet->decrement('balance', $amount);

        $wallet->refresh();

        return $wallet->transactions()->create([
            'amount' => $amount,

            'type' => 'manual_adjustment',

            'status' => 'completed',

            'balance_before' => $before,
            'balance_after' => $wallet->balance,

            'description' => $description,

            'processed_at' => now(),

            'created_by' => $createdBy,
        ]);
    });
}

    public function refund(
        Wallet $wallet,
        Booking $booking,
        float $amount,
        string $description,
        ?int $createdBy = null
    ): Transaction {

        if ($amount <= 0) {
            throw new Exception('Refund amount must be greater than zero.');
        }

        return DB::transaction(function () use (
            $wallet,
            $booking,
            $amount,
            $description,
            $createdBy
        ) {

            $before = $wallet->balance;

            $wallet->increment('balance', $amount);

            $wallet->refresh();

            return $wallet->transactions()->create([
                'amount' => $amount,

                'type' => 'refund',

                'status' => 'completed',

                'balance_before' => $before,
                'balance_after' => $wallet->balance,

                'description' => $description,

                'reference_type' => Booking::class,
                'reference_id' => $booking->id,

                'processed_at' => now(),

                'created_by' => $createdBy,
            ]);
        });
    }
public function eventPayment(
    Wallet $wallet,
    $event,
    float $amount,
    string $description,
    ?int $createdBy = null
): Transaction {

    if ($amount <= 0) {
        throw new Exception('Payment amount must be greater than zero.');
    }

    if ($wallet->balance < $amount) {

        throw new Exception(
            'رصيد المحفظة غير كافٍ.'
        );
    }

    return DB::transaction(function () use (
        $wallet,
        $event,
        $amount,
        $description,
        $createdBy
    ) {

        $before = $wallet->balance;

        $wallet->decrement('balance', $amount);

        $wallet->refresh();

        return $wallet->transactions()->create([

            'amount' => $amount,

            'type' => 'event_payment',

            'status' => 'completed',

            'balance_before' => $before,

            'balance_after' => $wallet->balance,

            'description' => $description,

            'reference_type' => \App\Models\Event::class,

            'reference_id' => $event->id,

            'processed_at' => now(),

            'created_by' => $createdBy,
        ]);
    });
}
}