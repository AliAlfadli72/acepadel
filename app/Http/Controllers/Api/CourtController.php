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
        $court = Court::findOrFail($id);
        $date = $request->query('date', date('Y-m-d'));

        $startOfDay = Carbon::parse($date)->startOfDay();
        // Since we handle slots up to 01:00 AM (which is next day), 
        // we check from 00:00 of the requested date until 06:00 of the next day.
        $endOfDay = Carbon::parse($date)->addDay()->addHours(6); 

        $bookings = Booking::where('court_id', $court->id)
            ->whereIn('status', ['pending', 'approved', 'completed'])
            ->where(function($query) use ($startOfDay, $endOfDay) {
                $query->whereBetween('start_time', [$startOfDay, $endOfDay])
                      ->orWhereBetween('end_time', [$startOfDay, $endOfDay]);
            })
            ->get();

        $bookedSlots = [];

        foreach ($bookings as $booking) {
            $currentSlot = $booking->start_time->copy();
            
            // Collect all hour slots that fall within this booking's duration
            while ($currentSlot->lt($booking->end_time)) {
                $bookedSlots[] = $currentSlot->format('H:i');
                $currentSlot->addHour(); 
            }
        }

        $now = now();
        $selectedDate = Carbon::parse($date);
        
        $slotsArray = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00','00:00','01:00'];
        
        foreach ($slotsArray as $slot) {
            $slotHour = (int) explode(':', $slot)[0];
            $slotMinute = (int) explode(':', $slot)[1];
            
            // Build the exact Carbon time for this slot
            $slotTime = $selectedDate->copy()->setTime($slotHour, $slotMinute);
            
            // If the slot is 00:00 or 01:00, it belongs to the NEXT day
            if ($slotHour == 0 || $slotHour == 1) {
                $slotTime->addDay();
            }
            
            // Disable if the slot is exactly in the past
            if ($slotTime->lt($now)) {
                $bookedSlots[] = $slot;
            }
        }

        $bookedSlots = array_values(array_unique($bookedSlots));

        // Available slots are all slots from $slotsArray that are not in $bookedSlots
        $availableSlots = array_values(array_diff($slotsArray, $bookedSlots));

        return response()->json([
            'status' => 'success',
            'data' => [
                'date' => $date,
                'available_slots' => $availableSlots,
                'booked_slots' => $bookedSlots,
            ],
            'booked_slots' => $bookedSlots // For web compatibility
        ]);
    }
}
