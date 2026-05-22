<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\BookingService;
use App\Models\Court;
use App\Models\Booking;
use App\Models\User;
use Inertia\Inertia;
use Carbon\Carbon;

class BookingController extends Controller
{
    protected BookingService $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    /**
     * Display a listing of courts and bookings.
     */
    public function index()
    {
        $courts = Court::with(['bookings' => function($query) {
            $query->whereIn('status', ['pending', 'approved'])
                  ->where('start_time', '>=', Carbon::now()->startOfDay());
        }])->where('is_active', true)->get();

        $userBookings = Auth::check() ? Auth::user()->bookings()->with('court')->latest()->get() : collect();

        return Inertia::render('Booking/Index', [
            'courts' => $courts,
            'userBookings' => $userBookings,
        ]);
    }
    public function guestBooking(){
            $courts = Court::where('is_active', true)->orderBy('id')->get();
            return Inertia::render('Booking', [
                'courts' => $courts,
            ]);
    }

    /**
     * Store a newly created booking in storage.
     */
public function store(Request $request)
{
    $rules = [
        'court_id'   => 'required|exists:courts,id',
        'start_time' => 'required|date|after:now',
        'end_time'   => 'required|date|after:start_time',
        'coach_id'   => 'nullable|exists:coach_profiles,id',
    ];

    // Guest validation
    if (!Auth::check()) {

        $rules['guest_name']  = 'required|string|max:255';

        $rules['guest_email'] = 'required|email|max:255';

        $rules['guest_phone'] = 'required|string|max:30';
    }

    try {

        $request->validate($rules);

    } catch (\Illuminate\Validation\ValidationException $e) {

        \Illuminate\Support\Facades\Log::error(
            'Booking Validation Errors:',
            $e->errors()
        );

        throw $e;
    }

    try {

        $court = Court::findOrFail($request->court_id);

        $pricePerHour = $court->price;

        /*
        |--------------------------------------------------------------------------
        | Detect existing player
        |--------------------------------------------------------------------------
        */

        $user = Auth::user();

        // Guest trying to book
        if (!$user) {

            $guestEmail = trim($request->guest_email);
            $guestPhone = trim($request->guest_phone);

            /*
            |--------------------------------------------------------------------------
            | VERY IMPORTANT:
            | Match BOTH email + phone to SAME player
            |--------------------------------------------------------------------------
            */

            $matchedUser = \App\Models\User::where('email', $guestEmail)
                ->where('phone', $guestPhone)
                ->first();
            if ($matchedUser) {
                $user = $matchedUser;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Create booking
        |--------------------------------------------------------------------------
        */

        $booking = $this->bookingService->createBooking(
            $user,
            $court,
            $request->start_time,
            $request->end_time,
            $pricePerHour,

            // Keep guest data if not matched
            $user ? null : $request->guest_name,

            $request->guest_phone,

            $request->coach_id
        );

        return redirect()->back()->with([
            'success'    => 'تم إرسال طلب الحجز بنجاح. بانتظار موافقة الإدارة.',
            'booking_id' => $booking->id
        ]);

    } catch (\Exception $e) {

        \Illuminate\Support\Facades\Log::error(
            'Booking Creation Error:',
            [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString()
            ]
        );

        return redirect()->back()->withErrors([
            'error' => $e->getMessage()
        ]);
    }
}

    /**
     * Cancel a booking.
     */
    public function cancel(Request $request, Booking $booking)
    {
        // Ensure user owns the booking or is admin
        if ($booking->user_id !== Auth::id() && !Auth::user()->hasRole(['Admin', 'Manager'])) {
            abort(403, 'Unauthorized action.');
        }

        try {
            $this->bookingService->cancelBooking($booking, Auth::user());
            return redirect()->back()->with('success', 'Booking cancelled and refunded successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Get availability for a specific court and date.
     */
    public function getAvailability(Court $court, Request $request)
    {
        $date = $request->query('date');
        if (!$date) {
            return response()->json(['booked_slots' => []]);
        }

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
                // Also add half-hour slots if duration is 1.5, to be safe, but our grid is 1 hour increments
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

        return response()->json([
            'booked_slots' => array_values(array_unique($bookedSlots))
        ]);
    }

    /**
     * Get available coaches for a specific court and time.
     */
    public function getAvailableCoaches(Court $court, Request $request)
    {
        $date = $request->query('date'); // 'Y-m-d'
        $time = $request->query('time'); // 'H:i'

        if (!$date || !$time) {
            return response()->json(['coaches' => []]);
        }

        $datetime = Carbon::parse("$date $time");
        
        // 0 = Sunday, 6 = Saturday in Laravel Carbon
        $dayOfWeek = $datetime->dayOfWeek;
        $timeString = $datetime->format('H:i:s');

        \Log::info("getAvailableCoaches parameters received", [
            'court_id' => $court->id,
            'date' => $date,
            'time' => $time,
            'parsed_datetime' => $datetime->toDateTimeString(),
            'day_of_week' => $dayOfWeek,
            'time_string' => $timeString
        ]);

        // Get coaches attached to this court
        $coaches = $court->coaches()
            ->with('user')
            ->whereHas('availabilities', function ($q) use ($dayOfWeek, $timeString) {
                $q->where('day_of_week', $dayOfWeek)
                  ->where('start_time', '<=', $timeString)
                  ->where('end_time', '>', $timeString);
            })
            ->get();

        // Filter out coaches who already have an approved/pending booking at this exact time
        $availableCoaches = $coaches->filter(function ($coach) use ($datetime) {
            $hasBooking = Booking::where('coach_profile_id', $coach->id)
                ->whereIn('status', ['pending', 'approved', 'completed'])
                ->where('start_time', '<=', $datetime)
                ->where('end_time', '>', $datetime)
                ->exists();
            return !$hasBooking;
        })->values();

        return response()->json([
            'coaches' => $availableCoaches
        ]);
    }
}
