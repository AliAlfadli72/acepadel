<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CourtController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\CoachController;
use App\Http\Controllers\Api\WebhookController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ─────────────────────────────────────────────────────────────
// WhatsApp OTP Authentication (المسار الرئيسي للموبايل)
// ─────────────────────────────────────────────────────────────
Route::prefix('otp')->group(function () {
    Route::post('/send',   [AuthController::class, 'sendOtp']);
    Route::post('/verify', [AuthController::class, 'verifyOtp']);
});

// ─────────────────────────────────────────────────────────────
// Meta WhatsApp Webhook
// Callback URL : https://acepadel.com/api/webhook/whatsapp
// Verify Token  : ace_padel_secure_webhook_token
// ─────────────────────────────────────────────────────────────
// GET  → Meta verification challenge (يجب قبول GET لإتمام إعداد الـ Webhook)
// POST → أحداث واتساب الواردة (رسائل، إيصالات، إلخ)
Route::match(['get', 'post'], '/webhook/whatsapp', [WebhookController::class, 'handle']);

// Legacy Auth Routes (للوحة الإدارة / احتياطي)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Protected API Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Bookings API
    Route::get('/user-bookings', [BookingController::class, 'userBookings']);
    Route::post('/bookings', [BookingController::class, 'store']);
    
    // Wallet API
    Route::get('/wallet', [WalletController::class, 'show']);
    Route::get('/wallet/transactions', [WalletController::class, 'transactions']);
    
    // Events API (Protected)
    Route::post('/events/{id}/register', [EventController::class, 'register']);

    // User Profile (Fresh data from server)
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/profile/update', [AuthController::class, 'updateProfile']);
    Route::post('/profile/notification-settings', [AuthController::class, 'updateNotificationSettings']);
    Route::post('/profile/update-fcm-token', [AuthController::class, 'updateFcmToken']);

    // Coach Routes — حجوزات المدرب
    Route::get('/coach/bookings', [CoachController::class, 'myBookings']);

    // Notifications API (Protected — needs auth to know which user)
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [\App\Http\Controllers\Api\NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [\App\Http\Controllers\Api\NotificationController::class, 'destroy']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/test', [\App\Http\Controllers\Api\NotificationController::class, 'test']);

    // Dev route to assign package for testing
    Route::post('/pilates/assign-package', function (Request $request) {
        $user = $request->user();
        $package = \App\Models\PilatesPackage::firstOrCreate(
            ['name' => '6-Class Monthly Pack'],
            [
                'total_classes' => 6,
                'price' => 120000.00,
                'valid_days' => 30
            ]
        );

        $userPackage = \App\Models\UserPilatesPackage::create([
            'user_id' => $user->id,
            'pilates_package_id' => $package->id,
            'remaining_classes' => 6,
            'expires_at' => now()->addDays(30)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Successfully assigned package!',
            'data' => $userPackage
        ]);
    });

    Route::post('/pilates/packages/buy', [\App\Http\Controllers\Api\PilatesApiController::class, 'buyPackage']);
});

// هذا الرابط (API) سيزود تطبيق الموبايل بمعلومات الأكاديمية
Route::get('/academy-info', function () {
    return response()->json([
        'status' => 'success',
        'data' => [
            'name' => 'آيس بادل أكاديمي',
            'location' => 'دمشق — أوتوستراد الفيحاء',
            'description' => 'الوجهة الرياضية والاجتماعية الأولى في قلب دمشق. نجمع بين التميز الرياضي ومعايير الاتحاد الدولي (FIP) لنقدم تجربة لا تضاهى.',
        ]
    ]);
});

// Courts API
Route::get('/courts', [CourtController::class, 'index']);
Route::get('/courts/{id}/availability', [CourtController::class, 'availability'])->name('api.courts.availability');
Route::get('/courts/{court}/available-coaches', [CoachController::class, 'availableCoaches'])->name('api.courts.coaches');

// Coaches API (public — needed for booking screen)
Route::get('/coaches', [CoachController::class, 'index']);

// Leaderboard API
Route::get('/leaderboard', [LeaderboardController::class, 'index']);

// Events API
Route::get('/events', [EventController::class, 'index']);

// Notifications are now inside auth:sanctum group above

// Pilates Studio Module API Routes
Route::prefix('pilates')->group(function () {
    Route::get('/sessions', [\App\Http\Controllers\Api\PilatesApiController::class, 'sessions']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/book', [\App\Http\Controllers\Api\PilatesApiController::class, 'book']);
        Route::get('/my-bookings', [\App\Http\Controllers\Api\PilatesApiController::class, 'myBookings']);
    });
});