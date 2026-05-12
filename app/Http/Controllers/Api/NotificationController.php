<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\DB;
use App\Services\PushNotificationService;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);

        $notifications = $user->notifications()->latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => $notifications
        ]);
    }

    public function unreadCount(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);

        return response()->json([
            'status' => 'success',
            'data' => ['count' => $user->unreadNotifications()->count()]
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);

        $notification = $user->notifications()->where('id', $id)->first();
        if ($notification) {
            $notification->markAsRead();
        }

        return response()->json(['status' => 'success']);
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);

        $user->unreadNotifications->markAsRead();

        return response()->json(['status' => 'success']);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);

        $notification = $user->notifications()->where('id', $id)->first();
        if ($notification) {
            $notification->delete();
            return response()->json(['status' => 'success', 'message' => 'Notification deleted successfully']);
        }

        return response()->json(['status' => 'error', 'message' => 'Notification not found'], 404);
    }

    // A test method to generate a dummy notification
    public function test(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);

        $title = 'تنبيه تجريبي من النظام';
        $body = 'هذا إشعار تجريبي للتحقق من وصول الإشعارات: ' . now()->toTimeString();

        // 1. Save to DB
        DB::table('notifications')->insert([
            'id' => \Illuminate\Support\Str::uuid(),
            'type' => 'App\Notifications\SystemNotification',
            'notifiable_type' => 'App\Models\User',
            'notifiable_id' => $user->id,
            'data' => json_encode([
                'title' => $title,
                'message' => $body,
                'type' => 'info'
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Send Push Notification if FCM exists
        $pushSent = false;
        if ($user->fcm_token) {
            $pushService = app(PushNotificationService::class);
            $pushSent = $pushService->sendToUser($user, $title, $body, ['type' => 'test_notification']);
        }

        return response()->json([
            'status' => 'success', 
            'message' => 'Test notification created',
            'push_sent' => $pushSent,
            'has_fcm' => !empty($user->fcm_token)
        ]);
    }
}
