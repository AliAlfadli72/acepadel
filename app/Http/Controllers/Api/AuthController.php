<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * بناء بيانات المستخدم الكاملة مع الملف الشخصي والمحفظة
     */
    private function buildUserData(User $user): array
    {
        $user->load(['playerProfile', 'wallet']);

        $profile = $user->playerProfile;
        $wallet  = $user->wallet;

        // جلب أهم دور للمستخدم بالأولوية:
        // Coach يغلب Player (شخص لاعب ومدرب → يُعامَل كمدرب في التطبيق)
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
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'phone'      => $user->phone,
            'image_path' => $user->image_path,
            'role'       => $role,
            'profile'    => $profile ? [
                'rank_level'     => $profile->rank_level  ?? 'D',
                'points'         => $profile->points       ?? 0,
                'matches_played' => $profile->matches_played ?? 0,
                'matches_won'    => $profile->matches_won  ?? 0,
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
                'balance' => $wallet->balance ?? 0,
                'pilates_balance' => $wallet->pilates_balance ?? 0,
            ] : [
                'balance' => 0,
                'pilates_balance' => 0,
            ],
            'notif_bookings' => (bool) ($user->notif_bookings ?? true),
            'notif_events'   => (bool) ($user->notif_events ?? true),
            'notif_offers'   => (bool) ($user->notif_offers ?? false),
        ];
    }

    public function register(Request $request)
    {
        try {
            $request->validate([
                'name'     => 'required|string|max:255',
                'identifier' => 'required|string',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $isEmail = filter_var($request->identifier, FILTER_VALIDATE_EMAIL);

            if ($isEmail) {
                $request->validate(['identifier' => 'unique:users,email']);
                $email = $request->identifier;
                $phone = 'DUMMY_' . time() . rand(100, 999);
            } else {
                $request->validate(['identifier' => 'unique:users,phone']);
                $phone = $request->identifier;
                $email = 'dummy_' . time() . rand(100, 999) . '@acepadel.local';
            }

            $user = User::create([
                'name'     => $request->name,
                'email'    => $email,
                'phone'    => $phone,
                'password' => Hash::make($request->password),
                'fcm_token'=> $request->fcm_token,
            ]);

            // إنشاء ملف شخصي للاعب تلقائياً
            $user->playerProfile()->create([
                'rank_level'     => 'D',
                'points'         => 0,
                'matches_played' => 0,
                'matches_won'    => 0,
            ]);

            // إنشاء محفظة فارغة تلقائياً
            $user->wallet()->create(['balance' => 0]);

            // تعيين دور Player تلقائياً لكل مستخدم جديد
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

        } catch (ValidationException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'بيانات التحقق غير صالحة.',
                'errors'  => $e->errors(),
            ], 422);
        }
    }

    public function login(Request $request)
    {
        try {
            $request->validate([
                'identifier' => 'required|string',
                'password'   => 'required|string',
            ]);

            $loginType = filter_var($request->identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
            $user = User::where($loginType, $request->identifier)->first();

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

        } catch (ValidationException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'بيانات التحقق غير صالحة.',
                'errors'  => $e->errors(),
            ], 422);
        }
    }

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

    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();
            
            $request->validate([
                'name'  => 'required|string|max:255',
                'phone' => 'required|string|max:20',
            ]);

            $user->name = $request->name;
            $user->phone = $request->phone;
            $user->save();

            return response()->json([
                'status'  => 'success',
                'message' => 'تم تحديث الملف الشخصي بنجاح',
                'data'    => $this->buildUserData($user),
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'بيانات التحقق غير صالحة.',
                'errors'  => $e->errors(),
            ], 422);
        }
    }

    public function updateNotificationSettings(Request $request)
    {
        try {
            $user = $request->user();
            
            $request->validate([
                'notif_bookings' => 'required|boolean',
                'notif_events'   => 'required|boolean',
                'notif_offers'   => 'required|boolean',
            ]);

            $user->notif_bookings = $request->notif_bookings;
            $user->notif_events = $request->notif_events;
            $user->notif_offers = $request->notif_offers;
            $user->save();

            return response()->json([
                'status'  => 'success',
                'message' => 'تم تحديث إعدادات الإشعارات بنجاح',
                'data'    => $this->buildUserData($user),
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'بيانات التحقق غير صالحة.',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'فشل تحديث الإعدادات: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function updateFcmToken(Request $request)
    {
        try {
            $request->validate([
                'fcm_token' => 'required|string',
            ]);

            $user = $request->user();
            $user->fcm_token = $request->fcm_token;
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'FCM Token updated successfully',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'بيانات التحقق غير صالحة.',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'فشل تحديث رمز FCM: ' . $e->getMessage(),
            ], 500);
        }
    }
}
