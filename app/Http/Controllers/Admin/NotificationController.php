<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = DB::table('notifications');

        $pilatesTypes = [
            'App\\Notifications\\PilatesSessionCancelledNotification',
            'App\\Notifications\\PilatesBookingConfirmedNotification',
            'App\\Notifications\\PilatesBookingCancelledNotification',
        ];

        if ($user->hasRole('Pilates Admin') || $user->hasRole('Pilates Coach')) {
            // إذا كان المستخدم يحمل صلاحيات البيلاتس فقط (وليس مديراً أو موظف استقبال عام)
            if (!$user->hasAnyRole(['Admin', 'Manager', 'Receptionist'])) {
                $query->whereIn('type', $pilatesTypes);
            }
        } else {
            // بقية المسؤولين يرون كافة الإشعارات العامة والمالية باستثناء إشعارات البيلاتس
            $query->whereNotIn('type', $pilatesTypes);
        }

        $notifications = $query->orderBy('created_at', 'desc')->paginate(10);

        // Map data JSON string to array
        $notifications->getCollection()->transform(function ($n) {
            $n->data = json_decode($n->data, true);
            // Get user info if possible (notifiable_id is user_id)
            $user = \App\Models\User::find($n->notifiable_id);
            $n->user = $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'image_path' => $user->image_path
            ] : null;
            return $n;
        });

        return Inertia::render('Admin/Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function destroy($id)
    {
        DB::table('notifications')->where('id', $id)->delete();
        return redirect()->back()->with('success', 'تم حذف الإشعار بنجاح');
    }

    public function clearAll()
    {
        DB::table('notifications')->delete();
        return redirect()->back()->with('success', 'تم مسح جميع الإشعارات بنجاح');
    }
}
