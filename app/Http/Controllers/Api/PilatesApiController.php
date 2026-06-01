<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PilatesSession;
use App\Models\PilatesBooking;
use App\Services\WalletService;
use App\Http\Requests\Pilates\BookSessionRequest;
use App\Notifications\PilatesBookingConfirmedNotification;
use App\Services\PushNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PilatesApiController extends Controller
{
    protected WalletService $walletService;
    protected PushNotificationService $pushService;

    public function __construct(WalletService $walletService, PushNotificationService $pushService)
    {
        $this->walletService = $walletService;
        $this->pushService = $pushService;
    }

    /**
     * Fetch all upcoming active Pilates sessions with remaining available slots.
     */
    public function sessions()
    {
        $today = now()->toDateString();
        $currentTime = now()->toTimeString();

        $sessions = PilatesSession::where('status', 'active')
            ->where(function ($query) use ($today, $currentTime) {
                $query->where('session_date', '>', $today)
                      ->orWhere(function ($q) use ($today, $currentTime) {
                          $q->where('session_date', $today)
                            ->where('start_time', '>=', $currentTime);
                      });
            })
            ->orderBy('session_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        // Append available slots attribute
        $sessions->each->makeVisible(['available_slots']);
        $sessions->each->append('available_slots');

        return response()->json([
            'success' => true,
            'data' => $sessions
        ]);
    }

    /**
     * Handle booking action.
     * Prevents overbooking using DB row locking and atomic operations.
     */
    public function book(BookSessionRequest $request)
    {
        $user = $request->user();
        $pilatesSessionId = $request->pilates_session_id;
        $paymentMethod = $request->payment_method;

        DB::beginTransaction();

        try {
            // Lock the session row for update to prevent concurrent double-booking
            $session = PilatesSession::lockForUpdate()->findOrFail($pilatesSessionId);

            if ($session->status !== 'active') {
                throw new \Exception('هذه الجلسة غير متاحة للحجز حالياً. / This session is not active.');
            }

            // Check slots availability
            $activeBookingsCount = $session->bookings()
                ->whereIn('status', ['confirmed', 'pending'])
                ->count();

            if ($activeBookingsCount >= $session->capacity) {
                throw new \Exception('عذراً، لا توجد شواغر متوفرة في هذه الجلسة. / No available slots left for this session.');
            }

            // Check if user already has an active booking for this session
            $alreadyBooked = PilatesBooking::where('user_id', $user->id)
                ->where('pilates_session_id', $session->id)
                ->whereIn('status', ['confirmed', 'pending'])
                ->exists();

            if ($alreadyBooked) {
                throw new \Exception('لقد قمت بحجز هذه الجلسة بالفعل. / You have already booked this session.');
            }

            $booking = null;

            if ($paymentMethod === 'wallet') {
                $wallet = $user->wallet;

                if (!$wallet || $wallet->balance < $session->price_per_session) {
                    throw new \Exception('رصيدك في المحفظة غير كافٍ لإتمام الحجز. / Insufficient wallet balance.');
                }

                // Create confirmed booking
                $booking = PilatesBooking::create([
                    'user_id' => $user->id,
                    'pilates_session_id' => $session->id,
                    'status' => 'confirmed',
                    'paid_amount' => $session->price_per_session,
                    'payment_method' => 'wallet',
                ]);

                // Deduct from wallet and create ledger entry
                $this->walletService->pilatesBookingPayment(
                    $wallet,
                    $booking,
                    $session->price_per_session,
                    "حجز جلسة بيلاتس #{$session->id} - {$session->title}"
                );
            } else {
                // Cash booking starts in a pending state until manual admin approval
                $booking = PilatesBooking::create([
                    'user_id' => $user->id,
                    'pilates_session_id' => $session->id,
                    'status' => 'pending',
                    'paid_amount' => 0.00,
                    'payment_method' => 'cash',
                ]);
            }

            DB::commit();

            // Send notification to user
            if ($booking->status === 'confirmed') {
                $user->notify(new PilatesBookingConfirmedNotification($booking));
            } else {
                $this->pushService->sendToUser(
                    $user,
                    'طلب حجز بيلاتس 🧘‍♀️',
                    'تم استلام طلب حجزك لجلسة "' . $session->title . '" بانتظار تأكيد الدفع النقدي من الإدارة.',
                    [
                        'type' => 'booking',
                        'pilates_booking_id' => (string) $booking->id
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'message' => $booking->status === 'confirmed' ? 'تم الحجز بنجاح وتم خصم الرصيد.' : 'تم تسجيل طلب الحجز بنجاح وبانتظار التأكيد.',
                'data' => $booking->load('pilatesSession')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Fetch authenticated player's Pilates history.
     */
    public function myBookings(Request $request)
    {
        $user = $request->user();

        $bookings = PilatesBooking::with('pilatesSession')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }
}
