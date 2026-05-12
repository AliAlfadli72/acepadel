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

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected API Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
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
Route::get('/courts/{id}/availability', [CourtController::class, 'availability']);

// Bookings API (Public for now, uses user_id parameter)
Route::get('/user-bookings', [BookingController::class, 'userBookings']);
Route::post('/bookings', [BookingController::class, 'store']);

// Wallet API (Public for now, uses user_id parameter)
Route::get('/wallet', [WalletController::class, 'show']);
Route::get('/wallet/transactions', [WalletController::class, 'transactions']);

// Leaderboard API
Route::get('/leaderboard', [LeaderboardController::class, 'index']);

// Events API
Route::get('/events', [EventController::class, 'index']);

// Notifications API
Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
Route::get('/notifications/unread-count', [\App\Http\Controllers\Api\NotificationController::class, 'unreadCount']);
Route::post('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
Route::post('/notifications/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
Route::post('/notifications/test', [\App\Http\Controllers\Api\NotificationController::class, 'test']);