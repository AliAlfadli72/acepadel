<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Court;
use App\Services\BookingService;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    protected BookingService $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    public function userBookings(Request $request)
    {
        $userId = $request->user()->id;

        $bookings = Booking::with(['court'])->where('user_id', $userId)->orderBy('start_time', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $bookings
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'court_id'   => 'required|exists:courts,id',
            'start_time' => 'required|date',
            'end_time'   => 'required|date|after:start_time',
            'coach_id'   => 'nullable|exists:coach_profiles,id',
        ]);

        try {
            $court = Court::findOrFail($validated['court_id']);
            $user  = $request->user();

            $booking = $this->bookingService->createBooking(
                $user,
                $court,
                $validated['start_time'],
                $validated['end_time'],
                $court->price,
                null,
                null,
                $validated['coach_id'] ?? null
            );

            event(new \App\Events\BookingStatusUpdated($booking->id, 'created'));
            
            if ($booking->status === 'approved') {
                $user->notify(new \App\Notifications\BookingConfirmedNotification($booking));
                if ($booking->coachProfile && $booking->coachProfile->user) {
                    $booking->coachProfile->user->notify(new \App\Notifications\CoachSessionConfirmedNotification($booking));
                }
            } else {
                $user->notify(new \App\Notifications\BookingPendingNotification($booking));
            }

            return response()->json([
                'status' => 'success',
                'message' => $booking->status === 'approved' ? 'تم تأكيد الحجز بنجاح.' : 'تم إرسال طلب الحجز بنجاح. بانتظار موافقة الإدارة.',
                'data' => $booking
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 409);
        }
    }
}
