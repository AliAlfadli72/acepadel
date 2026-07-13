<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Court;
use App\Models\User;
use App\Models\CoachProfile;
use App\Services\BookingService;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;


class AdminBookingController extends Controller
{
        protected WalletService $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }
        public function index(Request $request)
        {
            $user = auth()->user();

            $query = Booking::with([
                    'user',
                    'court',
                    'coachProfile.user'
                ])
                ->orderBy('start_time', 'desc');

            /*
            |--------------------------------------------------------------------------
            | ROLE-BASED ACCESS
            |--------------------------------------------------------------------------
            */

            // Coach → only bookings assigned to him
            if ($user->hasRole('Coach')) {

                $coachProfileId = optional($user->coachProfile)->id;

                $query->where('coach_profile_id', $coachProfileId);
            }

            // Player → only his own bookings
            elseif ($user->hasRole('Player')) {

                $query->where('user_id', $user->id);
            }

            // Admin + Reception → full access automatically


            /*
            |--------------------------------------------------------------------------
            | FILTER: STATUS
            |--------------------------------------------------------------------------
            */

            if ($request->filled('status') && $request->status !== 'all') {

                $query->where('status', $request->status);
            }


            /*
            |--------------------------------------------------------------------------
            | FILTER: SEARCH
            |--------------------------------------------------------------------------
            */

            if ($request->filled('search')) {

                $s = $request->search;

                $query->where(function ($q) use ($s) {

                    $q->whereHas('user', function ($u) use ($s) {

                        $u->where('name', 'like', "%{$s}%")
                        ->orWhere('phone', 'like', "%{$s}%");

                    })

                    ->orWhere('guest_name', 'like', "%{$s}%")
                    ->orWhere('guest_phone', 'like', "%{$s}%")

                    ->orWhereHas('court', function ($c) use ($s) {

                        $c->where('name', 'like', "%{$s}%");

                    });
                });
            }


            /*
            |--------------------------------------------------------------------------
            | FILTER: DATE
            |--------------------------------------------------------------------------
            */

            if ($request->filled('date')) {

                $date = Carbon::parse($request->date);

                $query->whereDate('start_time', $date);
            }


            /*
            |--------------------------------------------------------------------------
            | FILTER: TIME SLOT
            |--------------------------------------------------------------------------
            |
            | morning   = 06:00 → 12:00
            | afternoon = 12:00 → 17:00
            | evening   = 17:00 → 24:00
            |
            */

            if ($request->filled('time_slot')) {

                switch ($request->time_slot) {

                    case 'morning':

                        $query->whereTime('start_time', '>=', '06:00')
                            ->whereTime('start_time', '<', '12:00');

                        break;

                    case 'afternoon':

                        $query->whereTime('start_time', '>=', '12:00')
                            ->whereTime('start_time', '<', '17:00');

                        break;

                    case 'evening':

                        $query->whereTime('start_time', '>=', '17:00');

                        break;
                }
            }


            /*
            |--------------------------------------------------------------------------
            | FILTER: COURT
            |--------------------------------------------------------------------------
            */

            if ($request->filled('court_id')) {

                $query->where('court_id', $request->court_id);
            }


            /*
            |--------------------------------------------------------------------------
            | BOOKINGS PAGINATION
            |--------------------------------------------------------------------------
            */

            $bookings = $query
                ->paginate(10)
                ->withQueryString();


            /*
            |--------------------------------------------------------------------------
            | DROPDOWNS / SELECT DATA
            |--------------------------------------------------------------------------
            */

            $courts = Court::where('is_active', true)
                ->get(['id', 'name']);

            $players = User::role('Player')
                ->get(['id', 'name', 'phone', 'email']);

$coaches = CoachProfile::whereHas('user', function ($query) {
        $query->role('Coach');
    })
    ->with('user')
    ->get();


            /*
            |--------------------------------------------------------------------------
            | STATS
            |--------------------------------------------------------------------------
            */

            $statsQuery = clone $query;

            $stats = [

                'total' => (clone $statsQuery)->count(),

                'pending' => (clone $statsQuery)
                    ->where('status', 'pending')
                    ->count(),

                'approved' => (clone $statsQuery)
                    ->where('status', 'approved')
                    ->count(),

                'today' => (clone $statsQuery)
                    ->whereDate('start_time', today())
                    ->count(),
            ];


            /*
            |--------------------------------------------------------------------------
            | RETURN
            |--------------------------------------------------------------------------
            */

            return Inertia::render('Admin/Bookings/Index', [

                'bookings' => $bookings,

                'courts' => $courts,

                'players' => $players,

                'coaches' => $coaches,

                'stats' => $stats,

                'filters' => $request->only([
                    'status',
                    'search',
                    'date',
                    'time_slot',
                    'court_id'
                ]),
            ]);
        }

    public function store(Request $request)
    {
        $user = auth()->user();
        if (!$user || !$user->hasAnyRole(['Admin', 'admin', 'Receptionist'])) {
            abort(403, 'غير مصرح لك بإنشاء حجز يدوي.');
        }

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

        $booking = Booking::create([
            'user_id'     => $request->user_id,
            'court_id'    => $court->id,
            'coach_profile_id' => $request->coach_profile_id,
            'start_time'  => $start,
            'end_time'    => $end,
            'status'      => 'approved',
            'total_price' => $court->price * $request->duration,
        ]);
        
        event(new \App\Events\BookingStatusUpdated($booking->id, 'created'));

        return redirect()->back()->with('success', 'تم إنشاء الحجز بنجاح.');
    }

    public function approve(Booking $booking, \App\Services\PushNotificationService $pushService)
    {
        $booking->update(['status' => 'approved']);
        
        event(new \App\Events\BookingStatusUpdated($booking->id, 'approved'));
        
        if ($booking->user) {
            $booking->user->notify(new \App\Notifications\BookingConfirmedNotification($booking));
        }

        // Notify the coach if assigned
        if ($booking->coachProfile && $booking->coachProfile->user) {
            $booking->coachProfile->user->notify(new \App\Notifications\CoachSessionConfirmedNotification($booking));
        }

        return redirect()->back()->with('success', 'تم تأكيد الحجز بنجاح.');
    }

    public function reject(Booking $booking, \App\Services\PushNotificationService $pushService)
    {
        $booking->update(['status' => 'cancelled']);
        
        event(new \App\Events\BookingStatusUpdated($booking->id, 'cancelled'));
        
        if ($booking->user) {
            $booking->user->notify(new \App\Notifications\BookingCancelledNotification($booking));
        }

        return redirect()->back()->with('success', 'تم إلغاء الحجز.');
    }
    public function complete(Booking $booking)
{
    try {

        /*
        |------------------------------------------------------------------
        | Already completed
        |------------------------------------------------------------------
        */

        if ($booking->status === 'completed') {

            return back()->withErrors([
                'error' => 'الحجز مكتمل بالفعل.'
            ]);
        }

        /*
        |------------------------------------------------------------------
        | Visitor Booking
        |------------------------------------------------------------------
        */

        if (!$booking->user_id) {

            $booking->update([
                'status' => 'completed',
            ]);

            event(new \App\Events\BookingStatusUpdated($booking->id, 'completed'));

            return back()->with(
                'success',
                'تم إكمال حجز الزائر بنجاح.'
            );
        }

        /*
        |------------------------------------------------------------------
        | Already Paid
        |------------------------------------------------------------------
        */

        if ($booking->payment_status === 'paid') {

            $booking->update([
                'status' => 'completed',
            ]);

            if ($booking->user && $booking->user->playerProfile) {
                $booking->user->playerProfile->increment('matches_played');
            }

            event(new \App\Events\BookingStatusUpdated($booking->id, 'completed'));

            return back()->with(
                'success',
                'تم إكمال الحجز بنجاح.'
            );
        }

        /*
        |------------------------------------------------------------------
        | Wallet Payment
        |------------------------------------------------------------------
        */

        $wallet = $booking->user->wallet;

        if (!$wallet) {

            return back()->withErrors([
                'error' => 'اللاعب لا يملك محفظة.'
            ]);
        }

        if ($wallet->balance < $booking->total_price) {

            return back()->withErrors([
                'error' => 'رصيد المحفظة غير كافٍ.'
            ]);
        }

        $this->walletService->bookingPayment(
            $wallet,
            $booking,
            $booking->total_price,
            "حجز ملعب #{$booking->id}",
            auth()->id()
        );

        $booking->update([
            'status' => 'completed',
            'payment_status' => 'paid',
            'payment_method' => 'wallet',
            'paid_amount' => $booking->total_price,
        ]);

        if ($booking->user && $booking->user->playerProfile) {
            $booking->user->playerProfile->increment('matches_played');
        }

        event(new \App\Events\BookingStatusUpdated($booking->id, 'completed'));

        return back()->with(
            'success',
            'تم إكمال الحجز وخصم المبلغ من المحفظة.'
        );

    } catch (\Exception $e) {

        return back()->withErrors([
            'error' => $e->getMessage()
        ]);
    }
}



    public function updateStatus(Request $request, Booking $booking, \App\Services\PushNotificationService $pushService)
    {
        // dd('hello');
        $request->validate([
            'status' => 'required|in:pending,approved,rejected,cancelled,completed'
        ]);

        if ($request->status === 'completed' && $booking->status !== 'completed') {
            if ($booking->user && $booking->user->playerProfile) {
                $booking->user->playerProfile->increment('matches_played');
            }
        }

        $booking->update([
            'status' => $request->status
        ]);
        
        event(new \App\Events\BookingStatusUpdated($booking->id, $request->status));
        
        if ($booking->user) {
            if ($request->status === 'approved') {
                $booking->user->notify(new \App\Notifications\BookingConfirmedNotification($booking));
            } elseif ($request->status === 'cancelled' || $request->status === 'rejected') {
                $booking->user->notify(new \App\Notifications\BookingCancelledNotification($booking));
            } elseif ($request->status === 'completed') {
                $pushService->sendToUser(
                    $booking->user,
                    'تحديث حالة الحجز',
                    'تم إكمال حجزك بنجاح.',
                    ['booking_id' => $booking->id, 'status' => $request->status]
                );
            }
        }

        // Notify the coach if status is approved and coach is assigned
        if ($request->status === 'approved' && $booking->coachProfile && $booking->coachProfile->user) {
            $booking->coachProfile->user->notify(new \App\Notifications\CoachSessionConfirmedNotification($booking));
        }

        return back()->with('success', 'تم تحديث حالة الحجز بنجاح');
    }
    public function addPayment(Request $request, Booking $booking)
    {
        $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'payment_method' => ['required', 'in:cash,wallet,card,transfer'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Booking validation
        |--------------------------------------------------------------------------
        */

        if ($booking->status === 'cancelled') {
            return back()->withErrors([
                'amount' => 'لا يمكن إضافة دفعة إلى حجز ملغي.'
            ]);
        }

        $remaining = max(
            0,
            (float) $booking->total_price - (float) $booking->paid_amount
        );

        if ($remaining <= 0) {
            return back()->withErrors([
                'amount' => 'تم تسديد هذا الحجز بالكامل.'
            ]);
        }

        $amount = (float) $request->amount;

        if ($amount > $remaining) {
            return back()->withErrors([
                'amount' => "المبلغ يتجاوز المتبقي ({$remaining} ل.س)."
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Wallet Payment
        |--------------------------------------------------------------------------
        */

        if (
            $request->payment_method === 'wallet'
            && $booking->user
        ) {

            $wallet = $booking->user->wallet;

            if (!$wallet) {
                return back()->withErrors([
                    'payment_method' => 'لا يوجد محفظة مرتبطة بهذا اللاعب.'
                ]);
            }

            if ((float) $wallet->balance < $amount) {
                return back()->withErrors([
                    'amount' => 'رصيد المحفظة غير كافٍ لإتمام عملية الدفع.'
                ]);
            }

            $this->walletService->bookingPayment(
                $wallet,
                $booking,
                $amount,
                "دفعة حجز #{$booking->id}",
                auth()->id()
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Cash / Card / Transfer
        |--------------------------------------------------------------------------
        */

        else {

            \App\Models\Transaction::create([
                'wallet_id' => $booking->user?->wallet?->id,

                'amount' => $amount,

                'payment_method' => $request->payment_method,

                'type' => 'debit',

                'description' =>
                    "دفعة حجز رقم #{$booking->id} ({$request->payment_method})",

                'reference_type' => Booking::class,

                'reference_id' => $booking->id,

                'created_by' => auth()->id(),
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Update Booking
        |--------------------------------------------------------------------------
        */

        $newPaidAmount = (float) $booking->paid_amount + $amount;

        $paymentStatus = match (true) {
            $newPaidAmount <= 0 => 'unpaid',
            $newPaidAmount >= (float) $booking->total_price => 'paid',
            default => 'partial',
        };

        $booking->update([
            'paid_amount' => $newPaidAmount,

            'payment_method' => $request->payment_method,

            'payment_status' => $paymentStatus,
        ]);

        return back()->with(
            'success',
            'تمت إضافة الدفعة بنجاح'
        );
    }
}
