<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'phone' => 'required|string|max:20|unique:users',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'data' => [
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                    'user' => $user
                ]
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'بيانات التحقق غير صالحة.',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function login(Request $request)
    {
        try {
            $request->validate([
                'identifier' => 'required|string', // Could be email or phone
                'password' => 'required|string',
            ]);

            // Check if identifier is email or phone
            $loginType = filter_var($request->identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

            $user = User::where($loginType, $request->identifier)->first();

            if (! $user || ! Hash::check($request->password, $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'البيانات المدخلة غير صحيحة.'
                ], 401);
            }

            // Revoke all existing tokens (Optional: If you want only one active device)
            // $user->tokens()->delete();

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'data' => [
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                    'user' => $user
                ]
            ]);
        } catch (ValidationException $e) {
             return response()->json([
                'status' => 'error',
                'message' => 'بيانات التحقق غير صالحة.',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'data' => [
                'message' => 'تم تسجيل الخروج بنجاح'
            ]
        ]);
    }

    public function user(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => clone $request->user()
        ]);
    }
}
