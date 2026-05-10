<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Court;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Exception;

class BookingService
{
    protected WalletService $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }

    /**
     * Check if a court is available for a given time slot.
     */
    public function checkAvailability(Court $court, Carbon $startTime, Carbon $endTime): bool
    {
        // A court is unavailable if there's an overlapping booking that is not cancelled or rejected
        $overlappingBookings = Booking::where('court_id', $court->id)
            ->whereIn('status', ['pending', 'approved', 'completed'])
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where('start_time', '<', $endTime)
                      ->where('end_time', '>', $startTime);
            })->exists();

        return !$overlappingBookings;
    }

    /**
     * Create a new booking.
     */
    public function createBooking(
        ?User $user,
        Court $court,
        string $startTimeStr,
        string $endTimeStr,
        float $pricePerHour,
        ?string $guestName = null,
        ?string $guestPhone = null,
        ?int $coachId = null
    ): Booking {

        $startTime = Carbon::parse($startTimeStr);
        $endTime   = Carbon::parse($endTimeStr);

        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        if ($startTime->isPast()) {
            throw new Exception(
                "Cannot book in the past. / لا يمكنك الحجز في وقت ماضٍ."
            );
        }

        if ($endTime->lte($startTime)) {
            throw new Exception(
                "End time must be after start time. / وقت النهاية يجب أن يكون بعد وقت البداية."
            );
        }

        if (!$this->checkAvailability($court, $startTime, $endTime)) {
            throw new Exception(
                "Court is not available for the selected time slot. / الملعب غير متاح في الوقت المحدد."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | CALCULATE PRICE
        |--------------------------------------------------------------------------
        */

        $durationInHours = $startTime->diffInMinutes($endTime) / 60;

        $totalPrice = $durationInHours * $pricePerHour;

        /*
        |--------------------------------------------------------------------------
        | COACH PRICE
        |--------------------------------------------------------------------------
        */

        if ($coachId) {

            $coach = \App\Models\CoachProfile::find($coachId);

            if ($coach && $coach->hourly_rate > 0) {

                $totalPrice += (
                    $durationInHours * $coach->hourly_rate
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | ADMIN AUTO APPROVAL
        |--------------------------------------------------------------------------
        */

        $isAdmin = $user && (
            $user->hasRole(['Admin', 'admin'])
            || $user->can('bookings.approve')
        );

        /*
        |--------------------------------------------------------------------------
        | CREATE BOOKING
        |--------------------------------------------------------------------------
        */

        return DB::transaction(function () use (
            $user,
            $court,
            $startTime,
            $endTime,
            $totalPrice,
            $guestName,
            $guestPhone,
            $isAdmin,
            $coachId
        ) {

            $booking = Booking::create([

                'user_id' => $user?->id,

                'guest_name' => $guestName,

                'guest_phone' => $guestPhone,

                'court_id' => $court->id,

                'coach_profile_id' => $coachId,

                'start_time' => $startTime,

                'end_time' => $endTime,

                'status' => $isAdmin
                    ? 'approved'
                    : 'pending',

                'total_price' => $totalPrice,

                /*
                |--------------------------------------------------------------------------
                | NEW FIELDS YOU SHOULD ADD
                |--------------------------------------------------------------------------
                */

                'payment_status' => 'unpaid',

                'payment_method' => null,
            ]);

            return $booking;
        });
    }

    /**
     * Cancel a booking and refund the wallet.
     */
    public function cancelBooking(Booking $booking, User $cancelledBy): void
    {
        if (in_array($booking->status, ['cancelled', 'completed', 'rejected'])) {
            throw new Exception("Cannot cancel a booking that is already {$booking->status}.");
        }

        DB::transaction(function () use ($booking, $cancelledBy) {
            // Refund the user
            $this->walletService->deposit(
                $booking->user->wallet,
                $booking->total_price,
                "Refund for cancelled booking #{$booking->id}",
                $cancelledBy->id
            );

            $booking->status = 'cancelled';
            $booking->save();
        });
    }
}
