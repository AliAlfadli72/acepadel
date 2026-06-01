<?php

namespace App\Http\Controllers;

use App\Models\PilatesSession;
use App\Models\PilatesBooking;
use App\Services\WalletService;
use App\Http\Requests\Pilates\StoreSessionRequest;
use App\Http\Requests\Pilates\UpdateSessionRequest;
use App\Notifications\PilatesBookingConfirmedNotification;
use App\Notifications\PilatesBookingCancelledNotification;
use App\Notifications\PilatesSessionCancelledNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PilatesAdminController extends Controller
{
    protected WalletService $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }

    /**
     * Display all Pilates sessions and dashboard stats (total bookings and revenue).
     */
    public function index(Request $request)
    {
        $query = PilatesSession::withCount(['bookings' => function ($q) {
            $q->whereIn('status', ['confirmed', 'pending']);
        }]);

        // Optional search or filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('coach_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date')) {
            $query->whereDate('session_date', $request->date);
        }

        $sessions = $query->orderBy('session_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Calculate Stats
        $totalSessions = PilatesSession::count();
        $totalBookings = PilatesBooking::whereIn('status', ['confirmed', 'pending'])->count();
        
        // Revenue calculations
        $totalRevenue = PilatesBooking::where('status', 'confirmed')->sum('paid_amount');

        return Inertia::render('Admin/Pilates/Index', [
            'sessions' => $sessions,
            'filters' => $request->only(['search', 'date']),
            'stats' => [
                'total_sessions' => $totalSessions,
                'total_bookings' => $totalBookings,
                'total_revenue'  => (float) $totalRevenue,
            ]
        ]);
    }

    /**
     * Create a new Pilates session.
     */
    public function store(StoreSessionRequest $request)
    {
        PilatesSession::create($request->validated());

        return redirect()->back()->with('success', 'تم إنشاء جلسة البيلاتس بنجاح.');
    }

    /**
     * Edit Pilates session details.
     */
    public function update(UpdateSessionRequest $request, PilatesSession $session)
    {
        $session->update($request->validated());

        return redirect()->back()->with('success', 'تم تحديث بيانات الجلسة بنجاح.');
    }

    /**
     * Cancel/Delete a Pilates session.
     */
    public function destroy(PilatesSession $session)
    {
        DB::transaction(function () use ($session) {
            // Update session status to canceled
            $session->update(['status' => 'canceled']);

            // Get all active bookings for this session
            $bookings = $session->bookings()->whereIn('status', ['confirmed', 'pending'])->get();

            foreach ($bookings as $booking) {
                $booking->update(['status' => 'canceled']);

                $user = $booking->user;

                // Refund the user if payment was via wallet and paid_amount > 0
                if ($booking->payment_method === 'wallet' && $booking->paid_amount > 0 && $user && $user->wallet) {
                    $this->walletService->pilatesBookingRefund(
                        $user->wallet,
                        $booking,
                        $booking->paid_amount,
                        "إرجاع مبلغ إلغاء جلسة البيلاتس #{$session->id} من قبل الإدارة",
                        auth()->id()
                    );
                }

                // Send push notification to player about the session cancellation
                if ($user) {
                    $user->notify(new PilatesSessionCancelledNotification($session));
                }
            }
        });

        return redirect()->back()->with('success', 'تم إلغاء الجلسة بنجاح وإرجاع المبالغ للمشتركين.');
    }

    /**
     * Display bookings list with players details.
     */
    public function manageBookings(Request $request)
    {
        $query = PilatesBooking::with(['user', 'pilatesSession']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('session_id')) {
            $query->where('pilates_session_id', $request->session_id);
        }

        $bookings = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $sessions = PilatesSession::orderBy('session_date', 'desc')->get(['id', 'title', 'session_date']);

        return Inertia::render('Admin/Pilates/Bookings', [
            'bookings' => $bookings,
            'sessions' => $sessions,
            'filters'  => $request->only(['status', 'session_id'])
        ]);
    }

    /**
     * Manually confirm player bookings (specifically cash bookings).
     */
    public function confirmBooking(PilatesBooking $booking)
    {
        if ($booking->status === 'confirmed') {
            return redirect()->back()->withErrors(['error' => 'هذا الحجز مؤكد بالفعل.']);
        }

        DB::transaction(function () use ($booking) {
            $session = $booking->pilatesSession;

            // If cash, update paid_amount to session price
            if ($booking->payment_method === 'cash') {
                $booking->update([
                    'status' => 'confirmed',
                    'paid_amount' => $session->price_per_session,
                ]);
            } else {
                $booking->update([
                    'status' => 'confirmed'
                ]);
            }

            // Notify user
            if ($booking->user) {
                $booking->user->notify(new PilatesBookingConfirmedNotification($booking));
            }
        });

        return redirect()->back()->with('success', 'تم تأكيد الحجز بنجاح.');
    }

    /**
     * Manually cancel a player booking and refund wallet if charged.
     */
    public function cancelBooking(PilatesBooking $booking)
    {
        if ($booking->status === 'canceled') {
            return redirect()->back()->withErrors(['error' => 'هذا الحجز ملغى بالفعل.']);
        }

        DB::transaction(function () use ($booking) {
            $booking->update([
                'status' => 'canceled'
            ]);

            $user = $booking->user;

            // Refund user if paid via wallet
            if ($booking->payment_method === 'wallet' && $booking->paid_amount > 0 && $user && $user->wallet) {
                $this->walletService->pilatesBookingRefund(
                    $user->wallet,
                    $booking,
                    $booking->paid_amount,
                    "إرجاع حجز بيلاتس ملغي رقم #{$booking->id}",
                    auth()->id()
                );
            }

            // Notify user
            if ($user) {
                $user->notify(new PilatesBookingCancelledNotification($booking));
            }
        });

        return redirect()->back()->with('success', 'تم إلغاء الحجز وإعادة الرصيد للمحفظة إن وجد.');
    }
}
