<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::withCount('registrations')->orderBy('date', 'asc')->get();

        $formattedEvents = $events->map(function ($event) {
            return [
                'id'                   => $event->id,
                'title'                => $event->title,
                'description'          => $event->desc,
                'date'                 => $event->date ? $event->date->format('Y-m-d') : null,
                'start_time'           => $event->time ? $event->time->format('H:i') : '00:00',
                'end_time'             => $event->time ? $event->time->copy()->addHours(2)->format('H:i') : '02:00',
                'price'                => $event->fee,
                'max_participants'     => $event->max_participants,
                'current_participants' => $event->registrations_count,
                'status'               => $event->status ?? 'upcoming',
                'type'                 => $event->category ?? 'tournament',
                'image_url'            => $event->image_path ? asset('storage/' . $event->image_path) : null,
                'prize'                => $event->prize,
                'level'                => $event->level,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $formattedEvents,
        ]);
    }

    public function register(Request $request, $id)
    {
        // ── 1. التحقق من المصادقة ─────────────────────────────────────────
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'يرجى تسجيل الدخول أولاً للتسجيل في الفعالية.',
            ], 401);
        }

        // ── 2. جلب الفعالية ──────────────────────────────────────────────
        $event = Event::find($id);
        if (!$event) {
            return response()->json([
                'status'  => 'error',
                'message' => 'الفعالية غير موجودة.',
            ], 404);
        }

        // ── 3. التحقق من حالة الفعالية ───────────────────────────────────
        if ($event->status === 'cancelled') {
            return response()->json([
                'status'  => 'error',
                'message' => 'هذه الفعالية ملغاة.',
            ], 400);
        }

        if ($event->status === 'completed') {
            return response()->json([
                'status'  => 'error',
                'message' => 'انتهت هذه الفعالية.',
            ], 400);
        }

        // ── 4. التحقق من التسجيل المسبق ─────────────────────────────────
        $alreadyRegistered = EventRegistration::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($alreadyRegistered) {
            return response()->json([
                'status'  => 'error',
                'message' => 'أنت مسجل في هذه الفعالية مسبقاً.',
            ], 400);
        }

        // ── 5. التحقق من السعة ───────────────────────────────────────────
        $currentCount = EventRegistration::where('event_id', $event->id)->count();
        if ($currentCount >= $event->max_participants) {
            return response()->json([
                'status'  => 'error',
                'message' => 'عذراً، الفعالية ممتلئة ولا توجد مقاعد متاحة.',
            ], 400);
        }

        // ── 6. المعالجة داخل transaction آمنة ────────────────────────────
        try {
            DB::beginTransaction();

            // الخصم من المحفظة إذا كانت الفعالية مدفوعة
            if ($event->fee > 0) {
                $wallet = Wallet::firstOrCreate(
                    ['user_id' => $user->id],
                    ['balance' => 0]
                );

                if ($wallet->balance < $event->fee) {
                    DB::rollBack();
                    return response()->json([
                        'status'  => 'error',
                        'message' => 'رصيد المحفظة غير كافٍ. رصيدك الحالي: ' . number_format($wallet->balance, 0) . ' ل.س، ورسوم الفعالية: ' . number_format($event->fee, 0) . ' ل.س.',
                    ], 400);
                }

                $balanceBefore  = $wallet->balance;
                $wallet->balance -= $event->fee;
                $wallet->save();

                Transaction::create([
                    'wallet_id'      => $wallet->id,
                    'amount'         => $event->fee,
                    'type'           => 'debit', // نوع مدعوم في النظام
                    'status'         => 'completed',
                    'balance_before' => $balanceBefore,
                    'balance_after'  => $wallet->balance,
                    'reference_type' => Event::class,
                    'reference_id'   => $event->id,
                    'description'    => 'تسجيل في فعالية: ' . $event->title,
                    'created_by'     => $user->id,
                ]);
            }

            // إنشاء التسجيل
            $registration = EventRegistration::create([
                'event_id'  => $event->id,
                'user_id'   => $user->id,
                'status'    => 'approved',
                'placement' => null,
            ]);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'تم تسجيلك بنجاح في الفعالية!',
                'data'    => [
                    'registration_id'      => $registration->id,
                    'event_title'          => $event->title,
                    'event_date'           => $event->date?->format('Y-m-d'),
                    'remaining_seats'      => ($event->max_participants - $currentCount - 1),
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Event Registration Error: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.',
            ], 500);
        }
    }
}
