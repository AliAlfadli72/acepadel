<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Court;
use App\Models\Booking;
use Illuminate\Http\Request;
use Carbon\Carbon;
class CourtController extends Controller
{
    public function index()
    {
        $courts = Court::where('is_active', true)->get();
        return response()->json([
            'status' => 'success',
            'data' => $courts
        ]);
    }

    public function availability(Request $request, $id)
    {
        $date = $request->input('date', date('Y-m-d'));
        
        $bookings = Booking::where('court_id', $id)
            ->whereDate('start_time', $date)
            ->whereIn('status', ['approved', 'pending'])
            ->get();

        $bookedSlots = $bookings->map(function ($booking) {
            return Carbon::parse($booking->start_time)->format('H:i');
        })->toArray();

        // Academy working hours: 08:00 to 23:00 (last booking at 22:00)
        $availableSlots = [];
        for ($i = 8; $i <= 22; $i++) {
            $time = sprintf('%02d:00', $i);
            if (!in_array($time, $bookedSlots)) {
                $availableSlots[] = $time;
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'date' => $date,
                'available_slots' => array_values($availableSlots),
                'booked_slots' => array_values($bookedSlots),
            ]
        ]);
    }
}
