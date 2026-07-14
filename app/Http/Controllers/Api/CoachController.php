<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CoachController extends Controller
{
    /**
     * قائمة المدربين المتاحين
     * GET /api/coaches
     */
    public function index()
    {
        $coaches = User::role('Coach')
            ->with('coachProfile')
            ->get()
            ->map(function ($user) {
                $profile = $user->coachProfile;
                return [
                    'id'          => $profile?->id ?? $user->id,
                    'name'        => $user->name,
                    'specialty'   => $profile?->specialty ?? '',
                    'hourly_rate' => (float) ($profile?->hourly_rate ?? 0),
                    'photo'       => $user->image_path
                                        ? Storage::url($user->image_path)
                                        : null,
                    'user'        => [
                        'name' => $user->name,
                    ]
                ];
            });

        return response()->json([
            'status' => 'success',
            'data'   => $coaches,
        ]);
    }

    /**
     * قائمة المدربين المتاحين لملعب وتوقيت محددين
     * GET /api/courts/{court}/available-coaches
     */
    public function availableCoaches(\App\Models\Court $court, Request $request)
    {
        $date = $request->query('date'); // 'Y-m-d'
        $time = $request->query('time'); // 'H:i'

        if (!$date || !$time) {
            return response()->json([
                'status' => 'success',
                'data'   => [],
                'coaches' => [],
            ]);
        }

        $datetime = \Carbon\Carbon::parse("$date $time");
        
        // 0 = Sunday, 6 = Saturday in Laravel Carbon
        $dayOfWeek = $datetime->dayOfWeek;
        $timeString = $datetime->format('H:i:s');

        \Log::info("availableCoaches API parameters received", [
            'court_id' => $court->id,
            'date' => $date,
            'time' => $time,
            'parsed_datetime' => $datetime->toDateTimeString(),
            'day_of_week' => $dayOfWeek,
            'time_string' => $timeString
        ]);

        // Get coaches attached to this court
        $coaches = $court->coaches()
            ->with(['user', 'availabilities'])
            ->whereHas('user', function ($query) {
                $query->role('Coach');
            })
            ->whereHas('availabilities', function ($q) use ($dayOfWeek, $timeString) {
                $q->where('day_of_week', $dayOfWeek)
                ->where('start_time', '<=', $timeString)
                ->where('end_time', '>', $timeString);
            })
            ->get();

        // Filter out coaches who already have an approved/pending/completed booking at this exact time
        $availableCoaches = $coaches->filter(function ($coach) use ($datetime) {
            $hasBooking = Booking::where('coach_profile_id', $coach->id)
                ->whereIn('status', ['pending', 'approved', 'completed'])
                ->where('start_time', '<=', $datetime)
                ->where('end_time', '>', $datetime)
                ->exists();
            return !$hasBooking;
        })->map(function ($coach) {
            $user = $coach->user;
            return [
                'id'          => $coach->id, // This is coach_profile_id
                'name'        => $user?->name ?? '—',
                'specialty'   => $coach->specialty ?? '',
                'hourly_rate' => (float) ($coach->hourly_rate ?? 0),
                'photo'       => $user?->image_path
                                    ? Storage::url($user->image_path)
                                    : null,
                'user'        => [
                    'name' => $user?->name ?? '—',
                ]
            ];
        })->values();

        return response()->json([
            'status'  => 'success',
            'data'    => $availableCoaches, // For mobile
            'coaches' => $availableCoaches, // For web
        ]);
    }

    /**
     * جلب الحجوزات المرتبطة بالمدرب الحالي
     * GET /api/coach/bookings
     */
    public function myBookings(Request $request)
    {
        $user = $request->user();
        $mergedBookings = collect();

        // 1. حجوزات البادل (إذا كان للمستخدم ملف تعريف مدرب بادل)
        $coachProfileId = optional($user->coachProfile)->id;
        if ($coachProfileId) {
            $padelBookings = Booking::with(['court', 'user'])
                ->where('coach_profile_id', $coachProfileId)
                ->get()
                ->map(function ($booking) {
                    return [
                        'id'          => $booking->id,
                        'court_name'  => ($booking->court?->name ?? '—') . ' (بادل)',
                        'player_name' => $booking->user?->name  ?? '—',
                        'start_time'  => $booking->start_time,
                        'end_time'    => $booking->end_time,
                        'status'      => $booking->status,
                        'total_price' => (float)$booking->total_price,
                    ];
                });
            $mergedBookings = $mergedBookings->concat($padelBookings);
        }

        // 2. حجوزات البيلاتس (إذا كان المستخدم يحمل دور مدرب بيلاتس)
        if ($user->hasRole('Pilates Coach')) {
            $pilatesBookings = \App\Models\PilatesBooking::with(['user', 'pilatesSession'])
                ->whereHas('pilatesSession', function ($q) use ($user) {
                    $q->where('coach_id', $user->id);
                })
                ->get()
                ->map(function ($pb) {
                    $session = $pb->pilatesSession;
                    
                    $date = '';
                    if ($session->session_date) {
                        $date = is_string($session->session_date) 
                            ? substr($session->session_date, 0, 10) 
                            : $session->session_date->format('Y-m-d');
                    }
                    
                    $startTime = $session->start_time ? "$date {$session->start_time}" : '';
                    $endTime = $session->end_time ? "$date {$session->end_time}" : '';

                    $status = $pb->status;
                    if ($status === 'confirmed') {
                        $status = 'approved'; // لتتوافق مع تسميات تطبيق الموبايل (مؤكد)
                    } elseif ($status === 'canceled') {
                        $status = 'cancelled';
                    }

                    return [
                        'id'          => $pb->id,
                        'court_name'  => ($session->title ?? 'بيلاتس') . ' (بيلاتس)',
                        'player_name' => $pb->user?->name ?? '—',
                        'start_time'  => $startTime,
                        'end_time'    => $endTime,
                        'status'      => $status,
                        'total_price' => (float)$pb->paid_amount,
                    ];
                });
            $mergedBookings = $mergedBookings->concat($pilatesBookings);
        }

        // ترتيب الحجوزات تنازلياً حسب وقت البدء
        $sortedBookings = $mergedBookings->sortByDesc('start_time')->values();

        return response()->json([
            'status' => 'success',
            'data'   => $sortedBookings,
        ]);
    }
}

