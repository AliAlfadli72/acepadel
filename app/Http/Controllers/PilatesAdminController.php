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
        $user = auth()->user();
        $isCoachOnly = $user->hasRole('Pilates Coach') && !$user->hasAnyRole(['Admin', 'Pilates Admin']);

        $query = PilatesSession::with(['coach'])->withCount(['bookings' => function ($q) {
            $q->whereIn('status', ['confirmed', 'pending']);
        }]);

        if ($isCoachOnly) {
            $query->where('coach_id', $user->id);
        }

        // Optional search or filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('coach', function ($cQuery) use ($search) {
                      $cQuery->where('name', 'like', "%{$search}%");
                  });
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
        if ($isCoachOnly) {
            $totalSessions = PilatesSession::where('coach_id', $user->id)->count();
            $totalBookings = PilatesBooking::whereIn('status', ['confirmed', 'pending'])
                ->whereHas('pilatesSession', function ($q) use ($user) {
                    $q->where('coach_id', $user->id);
                })->count();
            $totalRevenue = PilatesBooking::where('status', 'confirmed')
                ->whereHas('pilatesSession', function ($q) use ($user) {
                    $q->where('coach_id', $user->id);
                })->sum('paid_amount');
        } else {
            $totalSessions = PilatesSession::count();
            $totalBookings = PilatesBooking::whereIn('status', ['confirmed', 'pending'])->count();
            $totalRevenue = PilatesBooking::where('status', 'confirmed')->sum('paid_amount');
        }

        // Get list of eligible coaches for dropdown (only Pilates Coaches and Pilates Admins)
        $coaches = \App\Models\User::role(['Pilates Coach', 'Pilates Admin'])
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Pilates/Index', [
            'sessions' => $sessions,
            'coaches' => $coaches,
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
        $session = PilatesSession::create($request->validated());

        // Send push notification to all users about the new session
        try {
            $users = \App\Models\User::whereNotNull('fcm_token')->get();
            $pushService = app(\App\Services\PushNotificationService::class);
            foreach ($users as $user) {
                $locale = $user->locale ?? 'ar';
                $title = $locale === 'en' ? 'New Pilates Session Added 🧘‍♀️' : 'جلسة بيلاتس جديدة 🧘‍♀️';
                $body = $locale === 'en'
                    ? "A new session '{$session->title}' has been scheduled."
                    : "تمت إضافة جلسة جديدة '{$session->title}' في جدول المواعيد.";

                $pushService->sendToUser($user, $title, $body, [
                    'type' => 'new_session',
                    'session_id' => (string) $session->id,
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send new session push notifications: ' . $e->getMessage());
        }

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
                } elseif ($booking->payment_method === 'package' && $booking->user_pilates_package_id) {
                    $userPackage = \App\Models\UserPilatesPackage::find($booking->user_pilates_package_id);
                    if ($userPackage) {
                        $userPackage->increment('remaining_classes');
                    }
                }

                // Send push notification to player about the session cancellation
                if ($user) {
                    $user->notify(new PilatesSessionCancelledNotification($session));
                }

                event(new \App\Events\PilatesBookingStatusUpdated($booking->id, 'canceled'));
            }
        });

        return redirect()->back()->with('success', 'تم إلغاء الجلسة بنجاح وإرجاع المبالغ للمشتركين.');
    }

    /**
     * Display bookings list with players details.
     */
    public function manageBookings(Request $request)
    {
        $user = auth()->user();
        $isCoachOnly = $user->hasRole('Pilates Coach') && !$user->hasAnyRole(['Admin', 'Pilates Admin']);

        $query = PilatesBooking::with(['user', 'pilatesSession.coach']);

        if ($isCoachOnly) {
            $query->whereHas('pilatesSession', function ($q) use ($user) {
                $q->where('coach_id', $user->id);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('session_id')) {
            $query->where('pilates_session_id', $request->session_id);
        }

        $bookings = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        if ($isCoachOnly) {
            $sessions = PilatesSession::where('coach_id', $user->id)
                ->orderBy('session_date', 'desc')
                ->get(['id', 'title', 'session_date']);
        } else {
            $sessions = PilatesSession::orderBy('session_date', 'desc')->get(['id', 'title', 'session_date']);
        }

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
            event(new \App\Events\PilatesBookingStatusUpdated($booking->id, 'confirmed'));
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
            } elseif ($booking->payment_method === 'package' && $booking->user_pilates_package_id) {
                $userPackage = \App\Models\UserPilatesPackage::find($booking->user_pilates_package_id);
                if ($userPackage) {
                    $userPackage->increment('remaining_classes');
                }
            }

            // Notify user
            if ($user) {
                $user->notify(new PilatesBookingCancelledNotification($booking));
            }
            event(new \App\Events\PilatesBookingStatusUpdated($booking->id, 'canceled'));
        });

        return redirect()->back()->with('success', 'تم إلغاء الحجز وإعادة الرصيد للمحفظة إن وجد.');
    }
}
