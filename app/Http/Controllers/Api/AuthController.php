<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Services\ImageUploadService;
use App\Services\WhatsAppAuthService;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\UpdateProfileRequest;
use App\Http\Requests\Api\UpdateNotificationSettingsRequest;
use App\Http\Requests\Api\UpdateFcmTokenRequest;

class AuthController extends Controller
{
    public function __construct(
        private readonly WhatsAppAuthService $whatsApp
    ) {}

    // ─────────────────────────────────────────────────────────────
    // HELPER — بناء بيانات المستخدم الكاملة مع الملف الشخصي والمحفظة
    // ─────────────────────────────────────────────────────────────

    private function buildUserData(User $user): array
    {
        $user->load(['playerProfile', 'wallet']);

        $profile = $user->playerProfile;
        $wallet  = $user->wallet;

        // جلب أهم دور للمستخدم بالأولوية
        $roles = $user->getRoleNames();
        if ($roles->contains('Coach')) {
            $role = 'Coach';
        } elseif ($roles->contains('Admin')) {
            $role = 'Admin';
        } elseif ($roles->contains('Manager')) {
            $role = 'Manager';
        } elseif ($roles->contains('Receptionist')) {
            $role = 'Receptionist';
        } elseif ($roles->contains('Staff')) {
            $role = 'Staff';
        } else {
            $role = $roles->first() ?? 'Player';
        }

        return [
            'id'             => $user->id,
            'name'           => $user->name,
            'phone'          => $user->phone,
            'phone_verified' => $user->isPhoneVerified(),
            'image_path'     => $user->image_path,
            'role'           => $role,
            'profile'        => $profile ? [
                'rank_level'     => $profile->rank_level    ?? 'D',
                'points'         => $profile->points         ?? 0,
                'matches_played' => $profile->matches_played ?? 0,
                'matches_won'    => $profile->matches_won    ?? 0,
                'win_rate'       => $profile->matches_played > 0
                    ? round(($profile->matches_won / $profile->matches_played) * 100)
                    : 0,
                'events_count'   => \App\Models\EventRegistration::where('user_id', $user->id)->count(),
            ] : [
                'rank_level'     => 'D',
                'points'         => 0,
                'matches_played' => 0,
                'matches_won'    => 0,
                'win_rate'       => 0,
                'events_count'   => 0,
            ],
            'wallet' => $wallet ? [
                'balance'         => $wallet->balance         ?? 0,
                'pilates_balance' => $wallet->pilates_balance ?? 0,
            ] : [
                'balance'         => 0,
                'pilates_balance' => 0,
            ],
            'notif_bookings' => (bool) ($user->notif_bookings ?? true),
            'notif_events'   => (bool) ($user->notif_events   ?? true),
            'notif_offers'   => (bool) ($user->notif_offers   ?? false),
        ];
    }

    // ─────────────────────────────────────────────────────────────
    // OTP — إرسال كود التحقق عبر واتساب
    // POST /api/otp/send
    // Body: { "phone": "+963991234567" }
    // ─────────────────────────────────────────────────────────────

    public function sendOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|min:9|max:20',
        ]);

        $phone = $request->phone;
        $otp   = $this->whatsApp->generateOtp();
        $ttl   = WhatsAppAuthService::OTP_TTL_MINUTES;

        // تحديث أو إنشاء مستخدم بالرقم
        $user = User::firstOrCreate(
            ['phone' => $phone],
            [
                'name'     => 'User',
                'email'    => null,
                'password' => null,
            ]
        );

        // حفظ OTP مع وقت الانتهاء
        $user->otp_code       = $otp;
        $user->otp_expires_at = now()->addMinutes($ttl);
        $user->save();

        $result = $this->whatsApp->sendOtp($phone, $otp);

        if (!$result['success']) {
            return response()->json([
                'status'  => 'error',
                'message' => 'فشل إرسال رمز التحقق. ' . $result['message'],
            ], 503);
        }

        return response()->json([
            'status'  => 'success',
            'message' => "تم إرسال رمز التحقق إلى {$phone} عبر واتساب. صالح لـ {$ttl} دقائق.",
            'data'    => [
                'phone'      => $phone,
                'expires_in' => $ttl * 60, // بالثواني — للـ Flutter countdown timer
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // OTP — التحقق من الكود وإتمام الدخول / التسجيل
    // POST /api/otp/verify
    // Body: { "phone": "+963991234567", "otp": "123456", "name": "Ali" (اختياري), "fcm_token": "..." (اختياري) }
    // ─────────────────────────────────────────────────────────────

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone'     => 'required|string',
            'otp'       => 'required|string|size:6',
            'name'      => 'sometimes|string|max:255',
            'fcm_token' => 'sometimes|string|nullable',
        ]);

        $user = User::where('phone', $request->phone)->first();

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'رقم الهاتف غير مسجل. أرسل OTP أولاً.',
            ], 404);
        }

        if (!$this->whatsApp->verifyOtp($user, $request->otp)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'رمز التحقق غير صحيح أو منتهي الصلاحية.',
            ], 422);
        }

        // OTP صحيح — تحديث بيانات المستخدم
        $isNewUser = is_null($user->phone_verified_at);

        $user->phone_verified_at = now();
        $user->otp_code          = null;
        $user->otp_expires_at    = null;

        if ($request->filled('name') && ($isNewUser || $user->name === 'User')) {
            $user->name = $request->name;
        }

        if ($request->filled('fcm_token')) {
            $user->fcm_token = $request->fcm_token;
        }

        $user->save();

        // تعيين دور Player للمستخدمين الجدد فقط
        if ($isNewUser && !$user->hasAnyRole(['Admin', 'Coach', 'Manager', 'Receptionist', 'Staff', 'Player'])) {
            $user->assignRole('Player');
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status'  => 'success',
            'message' => $isNewUser ? 'تم إنشاء حسابك بنجاح 🎉' : 'مرحباً بعودتك!',
            'data'    => [
                'access_token' => $token,
                'token_type'   => 'Bearer',
                'is_new_user'  => $isNewUser,
                'user'         => $this->buildUserData($user),
            ],
        ], $isNewUser ? 201 : 200);
    }

    // ─────────────────────────────────────────────────────────────
    // Legacy — تسجيل بكلمة مرور (للوحة الإدارة)
    // ─────────────────────────────────────────────────────────────

    public function register(RegisterRequest $request)
    {
        $isEmail = filter_var($request->identifier, FILTER_VALIDATE_EMAIL);

        $email = $isEmail ? $request->identifier : null;
        $phone = $isEmail ? ('DUMMY_' . time() . rand(100, 999)) : $request->identifier;

        $user = User::create([
            'name'      => $request->name,
            'email'     => $email,
            'phone'     => $phone,
            'password'  => Hash::make($request->password),
            'fcm_token' => $request->fcm_token,
        ]);

        $user->assignRole('Player');

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'data'   => [
                'access_token' => $token,
                'token_type'   => 'Bearer',
                'user'         => $this->buildUserData($user),
            ],
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────
    // Legacy — دخول بكلمة مرور (للوحة الإدارة)
    // ─────────────────────────────────────────────────────────────

    public function login(LoginRequest $request)
    {
        $loginType = filter_var($request->identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
        $user      = User::where($loginType, $request->identifier)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'البيانات المدخلة غير صحيحة.',
            ], 401);
        }

        if ($request->filled('fcm_token')) {
            $user->fcm_token = $request->fcm_token;
            $user->save();
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'data'   => [
                'access_token' => $token,
                'token_type'   => 'Bearer',
                'user'         => $this->buildUserData($user),
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // Protected routes
    // ─────────────────────────────────────────────────────────────

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->fcm_token = null;
        $user->save();
        $user->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'data'   => ['message' => 'تم تسجيل الخروج بنجاح'],
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data'   => $this->buildUserData($request->user()),
        ]);
    }

    public function user(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data'   => $this->buildUserData($request->user()),
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = $request->user();

        $user->name  = $request->name;
        $user->phone = $request->phone;

        if ($request->hasFile('image')) {
            $path = ImageUploadService::upload(
                $request->file('image'),
                'profiles',
                $user->image_path
            );
            $user->image_path = $path;
        }

        $user->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'تم تحديث الملف الشخصي بنجاح',
            'data'    => $this->buildUserData($user),
        ]);
    }

    public function updateNotificationSettings(UpdateNotificationSettingsRequest $request)
    {
        try {
            $user = $request->user();

            $user->notif_bookings = $request->notif_bookings;
            $user->notif_events   = $request->notif_events;
            $user->notif_offers   = $request->notif_offers;
            $user->save();

            return response()->json([
                'status'  => 'success',
                'message' => 'تم تحديث إعدادات الإشعارات بنجاح',
                'data'    => $this->buildUserData($user),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'فشل تحديث الإعدادات: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function updateFcmToken(UpdateFcmTokenRequest $request)
    {
        try {
            $user = $request->user();
            $user->fcm_token = $request->fcm_token;
            $user->save();

            return response()->json([
                'status'  => 'success',
                'message' => 'FCM Token updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'فشل تحديث رمز FCM: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Delete Account — Apple App Store Guideline 5.1.1(v)
    // DELETE /api/account
    // Strategy: Anonymize PII + hard-delete sensitive records.
    // Bookings & wallet transactions are preserved for admin reports.
    // ─────────────────────────────────────────────────────────────

    public function deleteAccount(Request $request)
    {
        $user = $request->user();

        // ── Guard: Block if user has active future bookings ───────
        $hasActiveBookings = \App\Models\Booking::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->where('start_time', '>', now())
            ->exists();

        if ($hasActiveBookings) {
            return response()->json([
                'status'  => 'error',
                'message' => 'لا يمكنك حذف الحساب لوجود حجوزات نشطة. يرجى إلغاؤها أولاً أو التواصل مع الإدارة.',
                'message_en' => 'Cannot delete account with active bookings. Please cancel them first or contact support.',
            ], 422);
        }

        // ── Step 1: Revoke all auth tokens ────────────────────────
        $user->tokens()->delete();

        // ── Step 2: Delete sensitive personal records ─────────────
        // Player profile (stats, rank)
        if ($user->playerProfile) {
            $user->playerProfile->delete();
        }

        // Notifications
        $user->notifications()->delete();

        // Event registrations
        \App\Models\EventRegistration::where('user_id', $user->id)->delete();

        // Pilates bookings & packages
        \App\Models\PilatesBooking::where('user_id', $user->id)->delete();
        \App\Models\UserPilatesPackage::where('user_id', $user->id)->delete();

        // ── Step 3: Anonymize the user row (preserve FK integrity) ─
        // Bookings, wallets, and transactions are intentionally kept
        // intact for admin financial reporting.
        $user->forceFill([
            'name'             => 'Deleted User',
            'phone'            => 'deleted_' . $user->id,
            'email'            => null,
            'image_path'       => null,
            'fcm_token'        => null,
            'otp_code'         => null,
            'otp_expires_at'   => null,
            'phone_verified_at' => null,
            'password'         => null,
        ])->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'تم حذف حسابك بنجاح.',
        ]);
    }
}
