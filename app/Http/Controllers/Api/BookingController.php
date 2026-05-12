<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Court;
use Illuminate\Http\Request;

class BookingController extends Controller
{
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
            'court_id' => 'required|exists:courts,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
        ]);

        // Check for availability logic (Overlap check: existing_start < new_end AND existing_end > new_start)
        $conflict = Booking::where('court_id', $validated['court_id'])
            ->where(function ($query) use ($validated) {
                $query->where('start_time', '<', $validated['end_time'])
                      ->where('end_time', '>', $validated['start_time']);
            })
            ->whereIn('status', ['approved', 'pending'])
            ->exists();

        if ($conflict) {
            return response()->json([
                'status' => 'error',
                'message' => 'الملعب غير متاح في هذا الوقت المختار.'
            ], 409);
        }

        $court = Court::find($validated['court_id']);
        $hours = (strtotime($validated['end_time']) - strtotime($validated['start_time'])) / 3600;
        $totalPrice = $court->price * $hours;

        $booking = Booking::create([
            'user_id' => $request->user()->id,
            'court_id' => $validated['court_id'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'status' => 'pending', 
            'total_price' => $totalPrice,
        ]);

        event(new \App\Events\BookingStatusUpdated($booking->id, 'created'));
        
        $request->user()->notify(new \App\Notifications\BookingConfirmedNotification($booking));

        return response()->json([
            'status' => 'success',
            'message' => 'تم إنشاء الحجز بنجاح.',
            'data' => $booking
        ], 201);
    }
}
