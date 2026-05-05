<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Court;
use App\Models\User;
use App\Models\CoachProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Services\BookingService;

class AdminBookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with(['user', 'court', 'coachProfile.user'])
            ->orderBy('start_time', 'desc');

        // ── Filter: status ─────────────────────────────────────────
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // ── Filter: search (player name / phone / guest / court) ───
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->whereHas('user', fn($u) => $u->where('name', 'like', "%$s%")
                                                  ->orWhere('phone', 'like', "%$s%"))
                  ->orWhere('guest_name',  'like', "%$s%")
                  ->orWhere('guest_phone', 'like', "%$s%")
                  ->orWhereHas('court',   fn($c) => $c->where('name', 'like', "%$s%"));
            });
        }

        // ── Filter: date ────────────────────────────────────────────
        if ($request->filled('date')) {
            $date = Carbon::parse($request->date);
            $query->whereDate('start_time', $date);
        }

        // ── Filter: time-of-day slot ────────────────────────────────
        // morning=06-12 | afternoon=12-17 | evening=17-24
        if ($request->filled('time_slot')) {
            switch ($request->time_slot) {
                case 'morning':
                    $query->whereTime('start_time', '>=', '06:00')
                          ->whereTime('start_time', '<',  '12:00');
                    break;
                case 'afternoon':
                    $query->whereTime('start_time', '>=', '12:00')
                          ->whereTime('start_time', '<',  '17:00');
                    break;
                case 'evening':
                    $query->whereTime('start_time', '>=', '17:00');
                    break;
            }
        }

        // ── Filter: court ───────────────────────────────────────────
        if ($request->filled('court_id')) {
            $query->where('court_id', $request->court_id);
        }

        $bookings = $query->paginate(10)->withQueryString();

        $courts  = Court::where('is_active', true)->get(['id','name']);
        $players = User::role('Player')->get(['id','name','phone','email']);
        $coaches = CoachProfile::with('user:id,name,phone,email')->get();

        // Quick stats for the header cards
        $stats = [
            'total'     => Booking::count(),
            'pending'   => Booking::where('status', 'pending')->count(),
            'approved'  => Booking::where('status', 'approved')->count(),
            'today'     => Booking::whereDate('start_time', today())->count(),
        ];

        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => $bookings,
            'courts'   => $courts,
            'players'  => $players,
            'coaches'  => $coaches,
            'stats'    => $stats,
            'filters'  => $request->only(['status','search','date','time_slot','court_id']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id'    => 'required|exists:users,id',
            'court_id'   => 'required|exists:courts,id',
            'date'       => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'duration'   => 'required|integer|min:1|max:4',
            'coach_profile_id' => 'nullable|exists:coach_profiles,id',
        ]);

        $court = Court::findOrFail($request->court_id);
        $start = Carbon::parse($request->date . ' ' . $request->start_time);
        $end   = $start->copy()->addHours((int) $request->duration);

        $conflict = Booking::where('court_id', $court->id)
            ->where('status', '!=', 'cancelled')
            ->where(fn($q) => $q->where('start_time', '<', $end)
                                ->where('end_time',   '>', $start))
            ->exists();

        if ($conflict) {
            return redirect()->back()->withErrors(['time' => 'يوجد حجز متعارض في هذا الوقت.']);
        }

        Booking::create([
            'user_id'     => $request->user_id,
            'court_id'    => $court->id,
            'coach_profile_id' => $request->coach_profile_id,
            'start_time'  => $start,
            'end_time'    => $end,
            'status'      => 'approved',
            'total_price' => $court->price * $request->duration,
        ]);

        return redirect()->back()->with('success', 'تم إنشاء الحجز بنجاح.');
    }

    public function approve(Booking $booking)
    {
        $booking->update(['status' => 'approved']);
        return redirect()->back()->with('success', 'تم تأكيد الحجز بنجاح.');
    }

    public function reject(Booking $booking)
    {
        $booking->update(['status' => 'cancelled']);
        return redirect()->back()->with('success', 'تم إلغاء الحجز.');
    }

    public function complete(Booking $booking)
    {
        $booking->update(['status' => 'completed']);
        return redirect()->back()->with('success', 'تم إكمال الحجز.');
    }
}
