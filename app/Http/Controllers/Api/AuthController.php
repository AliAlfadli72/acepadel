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

        return [
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'phone'      => $user->phone,
            'image_path' => $user->image_path,
            'profile'    => $profile ? [
                'rank_level'     => $profile->rank_level  ?? 'D',
                'points'         => $profile->points       ?? 0,
                'matches_played' => $profile->matches_played ?? 0,
                'matches_won'    => $profile->matches_won  ?? 0,
            ] : [
                'rank_level'     => 'D',
                'points'         => 0,
                'matches_played' => 0,
                'matches_won'    => 0,
            ],
            'wallet' => $wallet ? [
                'balance' => $wallet->balance ?? 0,
            ] : [
                'balance' => 0,
            ],
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
}
