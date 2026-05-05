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
    public function createBooking(?User $user, Court $court, string $startTimeStr, string $endTimeStr, float $pricePerHour, ?string $guestName = null, ?string $guestPhone = null, ?int $coachId = null): Booking
    {
        $startTime = Carbon::parse($startTimeStr);
        $endTime = Carbon::parse($endTimeStr);

        if ($startTime->isPast()) {
            throw new Exception("Cannot book in the past. / لا يمكنك الحجز في وقت ماضٍ.");
        }

        if ($endTime->lte($startTime)) {
            throw new Exception("End time must be after start time. / وقت النهاية يجب أن يكون بعد وقت البداية.");
        }

        if (!$this->checkAvailability($court, $startTime, $endTime)) {
            throw new Exception("Court is not available for the selected time slot. / الملعب غير متاح في الوقت المحدد.");
        }

        $durationInHours = $startTime->diffInMinutes($endTime) / 60;
        $totalPrice = $durationInHours * $pricePerHour;

        if ($coachId) {
            $coach = \App\Models\CoachProfile::find($coachId);
            if ($coach && $coach->hourly_rate > 0) {
                $totalPrice += ($durationInHours * $coach->hourly_rate);
            }
        }

        // An admin (or someone who can manage bookings) can book without wallet deductions
        $isAdmin = $user && ($user->hasRole(['Admin', 'admin']) || $user->hasPermissionTo('manage-bookings'));

        if ($user && !$isAdmin) {
            $wallet = $user->wallet;
            if (!$wallet) {
                // Auto-create a wallet for the user if it doesn't exist
                $wallet = $user->wallet()->create(['balance' => 0]);
            }

            if ($wallet->balance < $totalPrice) {
                throw new Exception("Insufficient funds. You need {$totalPrice} in your wallet. / رصيدك غير كافٍ. تحتاج إلى {$totalPrice} ل.س في محفظتك لإتمام الحجز.");
            }
        }

        return DB::transaction(function () use ($user, $court, $startTime, $endTime, $totalPrice, $guestName, $guestPhone, $isAdmin, $coachId) {
            // Deduct funds if authenticated user and not admin
            if ($user && !$isAdmin) {
                $this->walletService->deduct(
                    $user->wallet, 
                    $totalPrice, 
                    "Booking Court: {$court->name} from {$startTime->format('Y-m-d H:i')} to {$endTime->format('Y-m-d H:i')}", 
                    $user->id
                );
            }

            // Create booking
            $booking = Booking::create([
                'user_id' => $user ? $user->id : null,
                'guest_name' => $guestName,
                'guest_phone' => $guestPhone,
                'court_id' => $court->id,
                'coach_profile_id' => $coachId,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'status' => $isAdmin ? 'approved' : 'pending', // Auto-approve admin bookings
                'total_price' => $totalPrice,
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
