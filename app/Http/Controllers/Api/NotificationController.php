<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->input('user_id');
        if (!$userId) return response()->json(['status' => 'error', 'message' => 'user_id is required'], 400);

        $user = User::findOrFail($userId);
        $notifications = $user->notifications()->latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => $notifications
        ]);
    }

    public function unreadCount(Request $request)
    {
        $userId = $request->input('user_id');
        if (!$userId) return response()->json(['status' => 'error', 'message' => 'user_id is required'], 400);

        $user = User::findOrFail($userId);
        return response()->json([
            'status' => 'success',
            'data' => ['count' => $user->unreadNotifications()->count()]
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $userId = $request->input('user_id');
        if (!$userId) return response()->json(['status' => 'error', 'message' => 'user_id is required'], 400);

        $user = User::findOrFail($userId);
        $notification = $user->notifications()->where('id', $id)->first();
        if ($notification) {
            $notification->markAsRead();
        }

        return response()->json(['status' => 'success']);
    }

    public function markAllAsRead(Request $request)
    {
        $userId = $request->input('user_id');
        if (!$userId) return response()->json(['status' => 'error', 'message' => 'user_id is required'], 400);

        $user = User::findOrFail($userId);
        $user->unreadNotifications->markAsRead();

        return response()->json(['status' => 'success']);
    }

    // A test method to generate a dummy notification
    public function test(Request $request)
    {
        $userId = $request->input('user_id', 1);
        $user = User::findOrFail($userId);

        DB::table('notifications')->insert([
            'id' => \Illuminate\Support\Str::uuid(),
            'type' => 'App\Notifications\SystemNotification',
            'notifiable_type' => 'App\Models\User',
            'notifiable_id' => $user->id,
            'data' => json_encode([
                'title' => 'تنبيه جديد من النظام',
                'message' => 'تم إنشاء هذا الإشعار للاختبار: ' . now()->toTimeString(),
                'type' => 'info'
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Test notification created']);
    }
}
