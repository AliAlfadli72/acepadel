<?php

namespace App\Http\Controllers;

use App\Models\PilatesSession;
use App\Models\PilatesBooking;
use App\Services\WalletService;
use App\Services\PushNotificationService;
use App\Http\Requests\Pilates\BookSessionRequest;
use App\Notifications\PilatesBookingConfirmedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PilatesController extends Controller
{
    protected WalletService $walletService;
    protected PushNotificationService $pushService;

    public function __construct(WalletService $walletService, PushNotificationService $pushService)
    {
        $this->walletService = $walletService;
        $this->pushService = $pushService;
    }

    /**
     * Display a listing of upcoming active Pilates sessions for booking.
     */
    public function index()
    {
        $today = now()->toDateString();
        $currentTime = now()->toTimeString();

        $sessions = PilatesSession::with(['coach'])->where('status', 'active')
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

        $user = Auth::user();
        $sessions->each(function ($session) use ($user) {
            $session->append('available_slots');
            $session->has_booked = $user ? $session->bookings()
                ->where('user_id', $user->id)
                ->whereIn('status', ['confirmed', 'pending'])
                ->exists() : false;
        });

        $userWalletBalance = $user && $user->wallet ? (float) $user->wallet->balance : 0.0;
        
        $userActivePackages = $user ? $user->userPilatesPackages()
            ->where('remaining_classes', '>', 0)
            ->where('expires_at', '>=', now())
            ->with('pilatesPackage')
            ->get() : collect([]);

        // Create default Pilates Packages if none exist in the database
        if (\App\Models\PilatesPackage::count() === 0) {
            \App\Models\PilatesPackage::create([
                'name' => 'باقة 6 كلاسات (Silver)',
                'total_classes' => 6,
                'price' => 120000.00,
                'valid_days' => 30,
            ]);
            \App\Models\PilatesPackage::create([
                'name' => 'باقة 12 كلاس (Gold)',
                'total_classes' => 12,
                'price' => 220000.00,
                'valid_days' => 30,
            ]);
        }
        $packages = \App\Models\PilatesPackage::orderBy('total_classes', 'asc')->get();

        return Inertia::render('Pilates/Book', [
            'sessions' => $sessions,
            'walletBalance' => $userWalletBalance,
            'activePackages' => $userActivePackages,
            'packages' => $packages,
        ]);
    }

    /**
     * Subscribe/Buy a Pilates package.
     */
    public function buyPackage(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }

        $request->validate([
            'pilates_package_id' => 'required|exists:pilates_packages,id'
        ]);

        $package = \App\Models\PilatesPackage::findOrFail($request->pilates_package_id);
        $wallet = $user->wallet;

        if (!$wallet || $wallet->balance < $package->price) {
            return redirect()->back()->withErrors([
                'error' => 'رصيدك في المحفظة غير كافٍ لشراء هذه الباقة. يرجى شحن محفظتك أولاً.'
            ]);
        }

        DB::beginTransaction();

        try {
            // Deduct package price from player's wallet using manual adjustment
            $this->walletService->manualAdjustment(
                $wallet,
                $package->price,
                "شراء باقة بيلاتس: {$package->name}"
            );

            // Assign package to user
            \App\Models\UserPilatesPackage::create([
                'user_id' => $user->id,
                'pilates_package_id' => $package->id,
                'remaining_classes' => $package->total_classes,
                'expires_at' => now()->addDays($package->valid_days)
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'تم الاشتراك في الباقة بنجاح!');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->withErrors([
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Book a Pilates session for the authenticated user.
     */
    public function book(BookSessionRequest $request)
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }

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
            } elseif ($paymentMethod === 'package') {
                $userPackage = $user->userPilatesPackages()
                    ->where('remaining_classes', '>', 0)
                    ->where('expires_at', '>=', now())
                    ->orderBy('expires_at', 'asc')
                    ->first();

                if (!$userPackage) {
                    throw new \Exception('عذراً، لا تمتلك باقة نشطة أو رصيد حصص كافٍ. / You do not have an active package subscription or remaining classes.');
                }

                // Create confirmed booking using package class
                $booking = PilatesBooking::create([
                    'user_id' => $user->id,
                    'pilates_session_id' => $session->id,
                    'user_pilates_package_id' => $userPackage->id,
                    'status' => 'confirmed',
                    'paid_amount' => 0.00,
                    'payment_method' => 'package',
                ]);

                // Decrement package class
                $userPackage->decrement('remaining_classes');
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

            event(new \App\Events\PilatesBookingStatusUpdated($booking->id, $booking->status));

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

            $message = $booking->status === 'confirmed' 
                ? 'تم الحجز بنجاح وتم خصم الرصيد.' 
                : 'تم تسجيل طلب الحجز بنجاح وبانتظار التأكيد.';

            return redirect()->back()->with('success', $message);

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->withErrors([
                'error' => $e->getMessage()
            ]);
        }
    }
}
