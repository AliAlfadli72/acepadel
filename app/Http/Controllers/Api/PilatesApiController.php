<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PilatesSession;
use App\Models\PilatesBooking;
use App\Services\WalletService;
use App\Http\Requests\Pilates\BookSessionRequest;
use App\Notifications\PilatesBookingConfirmedNotification;
use App\Services\PushNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\Api\BuyPilatesPackageRequest;

class PilatesApiController extends Controller
{
    protected WalletService $walletService;
    protected PushNotificationService $pushService;

    public function __construct(WalletService $walletService, PushNotificationService $pushService)
    {
        $this->walletService = $walletService;
        $this->pushService = $pushService;
    }

    /**
     * Fetch all upcoming active Pilates sessions with remaining available slots.
     */
    public function sessions()
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

        $user = auth('sanctum')->user();
        $sessions->each(function ($session) use ($user) {
            $session->append('available_slots');
            $session->has_booked = $user ? $session->bookings()
                ->where('user_id', $user->id)
                ->whereIn('status', ['confirmed', 'pending'])
                ->exists() : false;
        });

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

        $userActivePackages = $user ? $user->userPilatesPackages()
            ->active()
            ->with('pilatesPackage')
            ->get() : [];

        $locale = app()->getLocale();
        $packages->each(function ($package) use ($locale) {
            $package->name = $this->translatePackageName($package->name, $locale);
        });

        if ($user && $userActivePackages) {
            $userActivePackages->each(function ($userPackage) use ($locale) {
                if ($userPackage->pilatesPackage) {
                    $userPackage->pilatesPackage->name = $this->translatePackageName($userPackage->pilatesPackage->name, $locale);
                }
            });
        }

        return response()->json([
            'success' => true,
            'data' => $sessions,
            'active_packages' => $userActivePackages,
            'packages' => $packages
        ]);
    }

    /**
     * Handle booking action.
     * Prevents overbooking using DB row locking and atomic operations.
     */
    public function book(BookSessionRequest $request)
    {
        $user = $request->user();
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

                if (!$wallet || $wallet->pilates_balance < $session->price_per_session) {
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

            // Send notification to user safely (do not block the user if notification service fails)
            try {
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
            } catch (\Exception $notificationException) {
                \Log::error('Pilates API booking notification failed: ' . $notificationException->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => $booking->status === 'confirmed' ? 'تم الحجز بنجاح وتم خصم الرصيد.' : 'تم تسجيل طلب الحجز بنجاح وبانتظار التأكيد.',
                'data' => $booking->load('pilatesSession')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Fetch authenticated player's Pilates history.
     */
    public function myBookings(Request $request)
    {
        $user = $request->user();

        $bookings = PilatesBooking::with('pilatesSession')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }

    /**
     * Subscribe/Buy a Pilates package via API.
     */
    public function buyPackage(BuyPilatesPackageRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();

        $package = \App\Models\PilatesPackage::findOrFail($validated['pilates_package_id']);

        // Check if user already has an active package (has remaining classes and is not expired)
        $hasActivePackage = $user->userPilatesPackages()
            ->active()
            ->exists();

        if ($hasActivePackage) {
            return response()->json([
                'success' => false,
                'message' => app()->getLocale() === 'en'
                    ? "Sorry, you already have an active package that hasn't expired. You cannot purchase another package until the current one is fully consumed or expired."
                    : "عذراً، لديك باقة نشطة بالفعل ولم تنتهي بعد. لا يمكنك شراء باقة أخرى حتى تستهلك الباقة الحالية بالكامل أو تنتهي صلاحيتها."
            ], 400);
        }

        $wallet = $user->wallet;

        if (!$wallet || $wallet->pilates_balance < $package->price) {
            return response()->json([
                'success' => false,
                'message' => app()->getLocale() === 'en'
                    ? "Your wallet balance is insufficient to purchase this package. Please top up your wallet first."
                    : "رصيدك في المحفظة غير كافٍ لشراء هذه الباقة. يرجى شحن محفظتك أولاً."
            ], 400);
        }

        DB::beginTransaction();

        try {
            // Deduct package price from player's wallet using Pilates manual adjustment
            $this->walletService->pilatesManualAdjustment(
                $wallet,
                $package->price,
                "شراء باقة بيلاتس: {$package->name}"
            );

            // Assign package to user
            $userPackage = \App\Models\UserPilatesPackage::create([
                'user_id' => $user->id,
                'pilates_package_id' => $package->id,
                'remaining_classes' => $package->total_classes,
                'expires_at' => now()->addDays($package->valid_days)
            ]);

            DB::commit();

            // Load and translate relation for instant response mapping
            $userPackage->load('pilatesPackage');
            if ($userPackage->pilatesPackage) {
                $userPackage->pilatesPackage->name = $this->translatePackageName($userPackage->pilatesPackage->name, app()->getLocale());
            }

            return response()->json([
                'success' => true,
                'message' => app()->getLocale() === 'en' ? 'Successfully subscribed to the package!' : 'تم الاشتراك في الباقة بنجاح!',
                'data' => $userPackage
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Helper to translate Pilates package name to English if locale is English.
     */
    private function translatePackageName($name, $locale)
    {
        if ($locale !== 'en') {
            return $name;
        }

        $translations = [
            'باقة 6 كلاسات (Silver)' => '6-Class Package (Silver)',
            'باقة 12 كلاس (Gold)' => '12-Class Package (Gold)',
            'باقة 6 كلاسات' => '6-Class Package',
            'باقة 12 كلاس' => '12-Class Package',
            'باقة 24 كلاس' => '24-Class Package',
            'باقة بيلاتس' => 'Pilates Package',
        ];

        if (isset($translations[$name])) {
            return $translations[$name];
        }

        // Fallback dynamic conversion using regex for numbers
        $translated = preg_replace('/باقة\s+(\d+)\s+كلاس(ات)?/u', '$1-Class Package', $name);

        if ($translated === $name) {
            $translated = str_replace('باقة', 'Package', $translated);
            $translated = str_replace('كلاسات', 'Classes', $translated);
            $translated = str_replace('كلاس', 'Classes', $translated);
            $translated = str_replace('حصة', 'Sessions', $translated);
            $translated = str_replace('حصص', 'Sessions', $translated);
        }

        return $translated;
    }
}
