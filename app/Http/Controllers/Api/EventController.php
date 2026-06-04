<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/events  — قائمة الفعاليات + حالة تسجيل المستخدم الحالي
    // ─────────────────────────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $user   = $request->user('sanctum') ?? auth('sanctum')->user();   // null إذا لم يسجّل دخول
        $userId = $user?->id;

        $events = Event::withCount([
            'registrations',
            // عدد المقاعد الفعلية المشغولة = approved فقط
            'registrations as approved_count' => fn ($q) => $q->where('status', 'approved'),
        ])->orderBy('date', 'desc')->get();

        // جلب تسجيلات المستخدم الحالي دفعةً واحدة
        $myRegistrations = $userId
            ? EventRegistration::where('user_id', $userId)
                ->whereIn('event_id', $events->pluck('id'))
                ->pluck('status', 'event_id')   // ['event_id' => 'pending|approved|rejected']
            : collect();

        $formattedEvents = $events->map(function ($event) use ($myRegistrations) {
            return [
                'id'                      => $event->id,
                'title'                   => $event->title,
                'description'             => $event->desc,
                'date'                    => $event->date ? $event->date->format('Y-m-d') : null,
                'start_time'              => $event->time ? $event->time->format('H:i') : '00:00',
                'end_time'                => $event->time ? $event->time->copy()->addHours(2)->format('H:i') : '02:00',
                'price'                   => $event->fee,
                'max_participants'        => $event->max_participants,
                'current_participants'    => $event->approved_count,   // approved فقط
                'status'                  => $event->status ?? 'upcoming',
                'type'                    => $event->category ?? 'tournament',
                'image_url'               => $event->image_path ? asset('storage/' . $event->image_path) : null,
                'prize'                   => $event->prize,
                'level'                   => $event->level,
                // حالة تسجيل المستخدم: null | 'pending' | 'approved' | 'rejected'
                'my_registration_status'  => $myRegistrations->get($event->id),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $formattedEvents,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/events/{id}/register  — إرسال طلب تسجيل (pending)
    // ─────────────────────────────────────────────────────────────────────────
    public function register(Request $request, $id)
    {
        // 1. التحقق من المصادقة
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'يرجى تسجيل الدخول أولاً للتسجيل في الفعالية.',
            ], 401);
        }

        // 2. جلب الفعالية
        $event = Event::find($id);
        if (!$event) {
            return response()->json([
                'status'  => 'error',
                'message' => 'الفعالية غير موجودة.',
            ], 404);
        }

        // 3. التحقق من حالة الفعالية
        if (in_array($event->status, ['cancelled', 'completed'])) {
            return response()->json([
                'status'  => 'error',
                'message' => $event->status === 'cancelled'
                    ? 'هذه الفعالية ملغاة.'
                    : 'انتهت هذه الفعالية.',
            ], 400);
        }

        // 4. التحقق من وجود طلب سابق (pending أو approved)
        $existing = EventRegistration::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            $msgs = [
                'pending'  => 'طلبك قيد المراجعة من قِبل الإدارة، يرجى الانتظار.',
                'approved' => 'أنت مسجَّل مسبقاً في هذه الفعالية.',
                'rejected' => 'تم رفض طلبك من قِبل الإدارة.',
            ];
            return response()->json([
                'status'  => 'error',
                'message' => $msgs[$existing->status] ?? 'أنت مسجّل مسبقاً.',
            ], 400);
        }

        // 5. التحقق من السعة (approved فقط)
        $approvedCount = EventRegistration::where('event_id', $event->id)
            ->where('status', 'approved')
            ->count();

        if ($approvedCount >= $event->max_participants) {
            return response()->json([
                'status'  => 'error',
                'message' => 'عذراً، الفعالية ممتلئة ولا توجد مقاعد متاحة.',
            ], 400);
        }

        // 6. إنشاء طلب التسجيل بحالة pending (بدون خصم — الخصم عند الموافقة)
        try {
            $registration = EventRegistration::create([
                'event_id'  => $event->id,
                'user_id'   => $user->id,
                'status'    => 'pending',
                'placement' => null,
            ]);

            // إشعار المستخدم بأن طلبه قيد المراجعة
            try {
                $user->notify(new \App\Notifications\EventRegistrationNotification($event));
            } catch (\Exception $notificationException) {
                \Log::error('Event registration notification failed: ' . $notificationException->getMessage());
            }

            return response()->json([
                'status'  => 'success',
                'message' => 'تم إرسال طلب تسجيلك بنجاح! سيتم مراجعته من قِبل الإدارة.',
                'data'    => [
                    'registration_id'     => $registration->id,
                    'registration_status' => 'pending',
                    'event_title'         => $event->title,
                    'event_date'          => $event->date?->format('Y-m-d'),
                ],
            ]);

        } catch (\Exception $e) {
            \Log::error('Event Registration Error: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.',
            ], 500);
        }
    }
}
