<?php


namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\WalletService;
use App\Models\Transaction;
use App\Models\Booking;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
public function index()
{
    $user = Auth::user();

    if ($user && $user->hasRole('Pilates Coach') && !$user->hasAnyRole(['Admin', 'Pilates Admin', 'Manager', 'Receptionist'])) {
        return redirect()->route('admin.pilates.index');
    }

    $stats = [

        'total_bookings' => 0,

        'wallet_balance' => 0,

        'upcoming_matches' => 0,

        'revenue_data' => [],

        'bookings_data' => [],

        'recent_activity' => [],
    ];

    $now = \Carbon\Carbon::now();

    $last7Days = collect(range(6, 0))
        ->map(fn ($day) =>
            $now->copy()
                ->subDays($day)
                ->format('Y-m-d')
        );

    $isPilates = $user && ($user->hasRole('Pilates Admin') || $user->hasRole('Pilates Coach')) && !$user->hasAnyRole(['Admin', 'Receptionist', 'Manager']);

    if ($isPilates) {
        $isCoachOnly = $user->hasRole('Pilates Coach') && !$user->hasRole('Pilates Admin');

        // Total Bookings
        $bookingsQuery = \App\Models\PilatesBooking::query();
        if ($isCoachOnly) {
            $bookingsQuery->whereHas('pilatesSession', function ($q) use ($user) {
                $q->where('coach_id', $user->id);
            });
        }
        $stats['total_bookings'] = $bookingsQuery->count();

        // Upcoming Sessions
        $sessionsQuery = \App\Models\PilatesSession::where('status', 'active')
            ->where('session_date', '>=', now()->toDateString());
        if ($isCoachOnly) {
            $sessionsQuery->where('coach_id', $user->id);
        }
        $stats['upcoming_matches'] = $sessionsQuery->count();

        // Total Pilates Players
        $playersQuery = \App\Models\User::role('Player')
            ->whereHas('pilatesBookings', function ($q) use ($isCoachOnly, $user) {
                if ($isCoachOnly) {
                    $q->whereHas('pilatesSession', function ($sq) use ($user) {
                        $sq->where('coach_id', $user->id);
                    });
                }
            });
        $stats['total_players'] = $playersQuery->count();

        // Total Pilates Coaches
        $stats['total_coaches'] = \App\Models\User::role('Pilates Coach')->count();

        // Active Sessions Today
        $stats['active_courts'] = \App\Models\PilatesSession::where('status', 'active')
            ->whereDate('session_date', now()->toDateString())
            ->count();

        // Revenue
        $revenueQuery = \App\Models\PilatesBooking::where('status', 'confirmed');
        if ($isCoachOnly) {
            $revenueQuery->whereHas('pilatesSession', function ($q) use ($user) {
                $q->where('coach_id', $user->id);
            });
        }
        $stats['total_revenue'] = (float)$revenueQuery->sum('paid_amount');

        // Charts data (Last 7 Days)
        $revenueData = [];
        $bookingsData = [];
        foreach ($last7Days as $date) {
            $dailyBookingsQuery = \App\Models\PilatesBooking::whereDate('created_at', $date);
            if ($isCoachOnly) {
                $dailyBookingsQuery->whereHas('pilatesSession', function ($q) use ($user) {
                    $q->where('coach_id', $user->id);
                });
            }
            $dailyBookingsCount = $dailyBookingsQuery->count();

            $dailyRevenueQuery = \App\Models\PilatesBooking::where('status', 'confirmed')->whereDate('created_at', $date);
            if ($isCoachOnly) {
                $dailyRevenueQuery->whereHas('pilatesSession', function ($q) use ($user) {
                    $q->where('coach_id', $user->id);
                });
            }
            $dailyRevenue = $dailyRevenueQuery->sum('paid_amount');

            $dayName = \Carbon\Carbon::parse($date)
                ->locale('ar')
                ->translatedFormat('D');

            $revenueData[] = [
                'date' => $dayName,
                'amount' => (float)$dailyRevenue,
                'revenue' => (float)$dailyRevenue,
                'expenses' => 0.0,
            ];

            $bookingsData[] = [
                'date' => $dayName,
                'count' => $dailyBookingsCount,
            ];
        }
        $stats['revenue_data'] = $revenueData;
        $stats['bookings_data'] = $bookingsData;

        // Recent Activity
        $activityQuery = \App\Models\PilatesBooking::with(['user', 'pilatesSession']);
        if ($isCoachOnly) {
            $activityQuery->whereHas('pilatesSession', function ($q) use ($user) {
                $q->where('coach_id', $user->id);
            });
        }
        $stats['recent_activity'] = $activityQuery->latest()
            ->take(5)
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'title' => 'حجز بيلاتس جديد: ' . ($b->user ? $b->user->name : 'زائر') . ' (' . ($b->pilatesSession ? $b->pilatesSession->title : '') . ')',
                    'time' => $b->created_at->locale('ar')->diffForHumans(),
                    'status' => $b->status,
                ];
            });

        // Top Coaches
        $stats['top_coaches'] = \App\Models\User::role(['Pilates Coach', 'Coach'])
            ->whereHas('pilatesBookings')
            ->get()
            ->map(function ($coach) {
                $sessionsCount = \App\Models\PilatesSession::where('coach_id', $coach->id)->count();
                $revenue = \App\Models\PilatesBooking::where('status', 'confirmed')
                    ->whereHas('pilatesSession', function ($q) use ($coach) {
                        $q->where('coach_id', $coach->id);
                    })->sum('paid_amount');

                return [
                    'id' => $coach->id,
                    'name' => $coach->name,
                    'revenue' => (float)$revenue,
                    'sessions' => $sessionsCount,
                ];
            })
            ->sortByDesc('revenue')
            ->take(4)
            ->values();

        // Top Players
        $stats['top_players'] = \App\Models\User::role('Player')
            ->whereHas('pilatesBookings')
            ->withCount(['pilatesBookings' => function ($q) {
                $q->where('status', 'confirmed');
            }])
            ->orderByDesc('pilates_bookings_count')
            ->take(4)
            ->get()
            ->map(function ($player) {
                return [
                    'id' => $player->id,
                    'name' => $player->name,
                    'matches' => $player->pilates_bookings_count,
                ];
            });

        // Session Occupancy
        $stats['session_occupancy'] = \App\Models\PilatesSession::withCount(['bookings' => function ($q) {
                $q->whereIn('status', ['confirmed', 'pending']);
            }])
            ->where('status', 'active')
            ->orderBy('session_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->take(4)
            ->get()
            ->map(function ($s) {
                $percentage = $s->capacity > 0 ? (int)round(($s->bookings_count / $s->capacity) * 100) : 0;
                return [
                    'name' => $s->title . ' (' . $s->session_date . ')',
                    'percentage' => $percentage,
                    'bookings' => $s->bookings_count . ' / ' . $s->capacity . ' مشترك',
                ];
            })
            ->values()
            ->toArray();

        // Next Upcoming Session Countdown
        $nextSession = \App\Models\PilatesSession::where('status', 'active')
            ->where('session_date', '>=', now()->toDateString())
            ->where(function ($q) {
                $q->where('session_date', '>', now()->toDateString())
                  ->orWhere('start_time', '>=', now()->toTimeString());
            })
            ->orderBy('session_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->first();

        $stats['next_session_time'] = $nextSession 
            ? \Carbon\Carbon::parse(substr((string)$nextSession->session_date, 0, 10) . ' ' . $nextSession->start_time)->toDateTimeString()
            : null;
        $stats['next_session_title'] = $nextSession ? $nextSession->title : null;

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'isPilates' => true,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Admin / Receptionist Dashboard
    |--------------------------------------------------------------------------
    */

    if (
        $user
        && (
            $user->hasRole('Admin')
            || $user->hasRole('Receptionist')
        )
    ) {

        /*
        |--------------------------------------------------------------------------
        | General Stats
        |--------------------------------------------------------------------------
        */

        $stats['total_bookings'] =
            \App\Models\Booking::count();

        $stats['upcoming_matches'] =
            \App\Models\Booking::whereIn('status', [
                    'approved',
                    'pending',
                ])
                ->where('start_time', '>', now())
                ->count();

        $stats['total_players'] =
            \App\Models\User::role('Player')->count();

        $stats['total_coaches'] =
            \App\Models\User::role('Coach')->count();

        $stats['active_courts'] =
            \App\Models\Court::where(
                'is_active',
                true
            )->count();

        /*
        |--------------------------------------------------------------------------
        | Revenue Totals
        |--------------------------------------------------------------------------
        */

        $totalRevenue =
            \App\Models\Transaction::whereIn('type', [

                    'booking_payment',
                    'event_payment',

                ])
                ->sum('amount');

        /*
        |--------------------------------------------------------------------------
        | Expenses Totals
        |--------------------------------------------------------------------------
        */

        $totalExpenses = 0;

        /*
        |--------------------------------------------------------------------------
        | One Time Expenses
        |--------------------------------------------------------------------------
        */

        $totalExpenses +=
            \App\Models\Expense::where(
                    'type',
                    'one_time'
                )
                ->sum('amount');

        /*
        |--------------------------------------------------------------------------
        | Monthly Expenses
        |--------------------------------------------------------------------------
        */

        $monthlyExpenses =
            \App\Models\Expense::where(
                    'type',
                    'monthly'
                )
                ->where('active', true)
                ->get();

        foreach ($monthlyExpenses as $expense) {

            $startDate =
                \Carbon\Carbon::parse(
                    $expense->starts_at
                );

            $monthsCount =
                $startDate->diffInMonths(now()) + 1;

            $totalExpenses +=
                ($expense->amount * $monthsCount);
        }

        /*
        |--------------------------------------------------------------------------
        | Yearly Expenses
        |--------------------------------------------------------------------------
        */

        $yearlyExpenses =
            \App\Models\Expense::where(
                    'type',
                    'yearly'
                )
                ->where('active', true)
                ->get();

        foreach ($yearlyExpenses as $expense) {

            $startDate =
                \Carbon\Carbon::parse(
                    $expense->starts_at
                );

            $yearsCount =
                $startDate->diffInYears(now()) + 1;

            $totalExpenses +=
                ($expense->amount * $yearsCount);
        }

        /*
        |--------------------------------------------------------------------------
        | Net Profit
        |--------------------------------------------------------------------------
        */

        $netProfit =
            $totalRevenue - $totalExpenses;

        $stats['total_revenue'] =
            $totalRevenue;

        $stats['total_expenses'] =
            $totalExpenses;

        $stats['net_profit'] =
            $netProfit;

        /*
        |--------------------------------------------------------------------------
        | Charts
        |--------------------------------------------------------------------------
        */

        $revenueData = [];

        $bookingsData = [];

        foreach ($last7Days as $date) {

            /*
            |--------------------------------------------------------------------------
            | Daily Bookings
            |--------------------------------------------------------------------------
            */

            $dailyBookingsCount =
                \App\Models\Booking::whereDate(
                        'created_at',
                        $date
                    )
                    ->count();

            /*
            |--------------------------------------------------------------------------
            | Daily Revenue
            |--------------------------------------------------------------------------
            */

            $dailyRevenue =
                \App\Models\Transaction::whereIn('type', [

                        'booking_payment',
                        'event_payment',

                    ])
                    ->whereDate(
                        'created_at',
                        $date
                    )
                    ->sum('amount');

            /*
            |--------------------------------------------------------------------------
            | Daily Expenses
            |--------------------------------------------------------------------------
            */

            $dailyExpenses = 0;

            /*
            |--------------------------------------------------------------------------
            | One Time Daily Expenses
            |--------------------------------------------------------------------------
            */

            $dailyExpenses +=
                \App\Models\Expense::where(
                        'type',
                        'one_time'
                    )
                    ->whereDate(
                        'expense_date',
                        $date
                    )
                    ->sum('amount');

            /*
            |--------------------------------------------------------------------------
            | Monthly Daily Expenses
            |--------------------------------------------------------------------------
            */

            $monthlyDailyExpenses =
                \App\Models\Expense::where(
                        'type',
                        'monthly'
                    )
                    ->where('active', true)
                    ->get();

            foreach (
                $monthlyDailyExpenses
                as $expense
            ) {

                if (

                    \Carbon\Carbon::parse($date)->day
                    ==
                    \Carbon\Carbon::parse(
                        $expense->starts_at
                    )->day

                ) {

                    $dailyExpenses +=
                        $expense->amount;
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Yearly Daily Expenses
            |--------------------------------------------------------------------------
            */

            $yearlyDailyExpenses =
                \App\Models\Expense::where(
                        'type',
                        'yearly'
                    )
                    ->where('active', true)
                    ->get();

            foreach (
                $yearlyDailyExpenses
                as $expense
            ) {

                $expenseDate =
                    \Carbon\Carbon::parse(
                        $expense->starts_at
                    );

                $currentDate =
                    \Carbon\Carbon::parse($date);

                if (

                    $expenseDate->day
                    ==
                    $currentDate->day

                    &&

                    $expenseDate->month
                    ==
                    $currentDate->month

                ) {

                    $dailyExpenses +=
                        $expense->amount;
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Net Daily Profit
            |--------------------------------------------------------------------------
            */

            $dailyProfit =
                $dailyRevenue - $dailyExpenses;

            $dayName =
                \Carbon\Carbon::parse($date)
                    ->locale('ar')
                    ->translatedFormat('D');

            $revenueData[] = [

                'date' => $dayName,

                'amount' => $dailyProfit,

                'revenue' => $dailyRevenue,

                'expenses' => $dailyExpenses,
            ];

            $bookingsData[] = [

                'date' => $dayName,

                'count' => $dailyBookingsCount,
            ];
        }

        $stats['revenue_data'] =
            $revenueData;

        $stats['bookings_data'] =
            $bookingsData;

        /*
        |--------------------------------------------------------------------------
        | Recent Activity
        |--------------------------------------------------------------------------
        */

        $stats['recent_activity'] =
            \App\Models\Booking::with('user')
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($b) {

                    return [

                        'id' => $b->id,

                        'title' =>
                            'حجز جديد: '
                            .
                            ($b->user
                                ? $b->user->name
                                : 'زائر'),

                        'time' =>
                            $b->created_at
                                ->locale('ar')
                                ->diffForHumans(),

                        'status' =>
                            $b->status,
                    ];
                });

        /*
        |--------------------------------------------------------------------------
        | Top Coaches
        |--------------------------------------------------------------------------
        */

        $stats['top_coaches'] =
            \App\Models\User::role('Coach')
                ->with('coachProfile')
                ->get()
                ->map(function ($coach) {

                    return [

                        'id' => $coach->id,

                        'name' => $coach->name,

                        'revenue' =>
                            $coach->coachProfile
                                ? $coach->coachProfile->total_revenue
                                : 0,

                        'sessions' =>
                            $coach->coachProfile
                                ? $coach->coachProfile->total_sessions
                                : 0,
                    ];
                })
                ->sortByDesc('revenue')
                ->take(4)
                ->values();

        /*
        |--------------------------------------------------------------------------
        | Top Players
        |--------------------------------------------------------------------------
        */

        $stats['top_players'] =
            \App\Models\User::role('Player')
                ->withCount('bookings')
                ->orderByDesc('bookings_count')
                ->take(4)
                ->get()
                ->map(function ($player) {

                    return [

                        'id' => $player->id,

                        'name' => $player->name,

                        'matches' =>
                            $player->bookings_count,
                    ];
                });

        // حساب إشغال الملاعب الفعلي للبادل
        $stats['court_occupancy'] = \App\Models\Court::where('is_active', true)
            ->get()
            ->map(function ($court) {
                $todayBookingsCount = \App\Models\Booking::where('court_id', $court->id)
                    ->whereDate('start_time', today())
                    ->where('status', '!=', 'cancelled')
                    ->count();

                // نفترض أن الحد الأقصى لساعات الإشغال اليومي هو 12 ساعة (حجز)
                $percentage = min(100, (int)round(($todayBookingsCount / 12) * 100));

                $bookingsLabel = $todayBookingsCount === 1 
                    ? 'حجز واحد اليوم' 
                    : ($todayBookingsCount === 2 
                        ? 'حجزان اليوم' 
                        : ($todayBookingsCount > 2 && $todayBookingsCount <= 10 
                            ? "$todayBookingsCount حجوزات اليوم" 
                            : "$todayBookingsCount حجز اليوم"));

                return [
                    'name' => $court->name,
                    'percentage' => $percentage,
                    'bookings' => $bookingsLabel,
                ];
            })
            ->values()
            ->toArray();

        $totalCourtsCount = \App\Models\Court::where('is_active', true)->count();
        $totalTodayBookingsCount = \App\Models\Booking::whereDate('start_time', today())
            ->where('status', '!=', 'cancelled')
            ->count();

        $stats['court_occupancy_avg'] = $totalCourtsCount > 0 
            ? min(100, (int)round(($totalTodayBookingsCount / ($totalCourtsCount * 12)) * 100)) 
            : 0;

    } else {

        /*
        |--------------------------------------------------------------------------
        | Player Dashboard
        |--------------------------------------------------------------------------
        */

        $stats['wallet_balance'] = ($user && $user->wallet) ? (float)$user->wallet->balance : 0.0;

        // Active Pilates packages with remaining classes
        $stats['active_packages'] = \App\Models\UserPilatesPackage::with('pilatesPackage')
            ->where('user_id', $user->id)
            ->active()
            ->get()
            ->map(function ($upp) {
                return [
                    'package_name' => $upp->pilatesPackage?->name ?? 'باقة بيلاتس',
                    'remaining_classes' => $upp->remaining_classes,
                    'expires_at' => $upp->expires_at ? $upp->expires_at->format('Y-m-d') : null,
                ];
            })->toArray();

        // Upcoming Padel Bookings
        $upcomingPadel = \App\Models\Booking::with('court')
            ->where('user_id', $user->id)
            ->where('start_time', '>=', now())
            ->whereIn('status', ['approved', 'pending'])
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'type' => 'padel',
                    'title' => ($b->court?->name ?? 'بادل') . ' (بادل)',
                    'start_time' => $b->start_time,
                    'end_time' => $b->end_time,
                    'status' => $b->status,
                ];
            });

        // Upcoming Pilates Bookings
        $upcomingPilates = \App\Models\PilatesBooking::with('pilatesSession')
            ->where('user_id', $user->id)
            ->whereHas('pilatesSession', function ($q) {
                $q->where('session_date', '>=', now()->toDateString());
            })
            ->whereIn('status', ['confirmed', 'pending'])
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
                    $status = 'approved';
                }
                
                return [
                    'id' => $pb->id,
                    'type' => 'pilates',
                    'title' => ($session->title ?? 'جلسة بيلاتس') . ' (بيلاتس)',
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'status' => $status,
                ];
            });

        // Merged upcoming bookings
        $upcomingBookings = $upcomingPadel->concat($upcomingPilates)
            ->sortBy('start_time')
            ->values();

        $stats['upcoming_bookings'] = $upcomingBookings->take(5)->toArray();
        $stats['upcoming_matches'] = $upcomingBookings->count();

        // Past Bookings (Recent Activities)
        $pastPadel = \App\Models\Booking::with('court')
            ->where('user_id', $user->id)
            ->where('start_time', '<', now())
            ->orderBy('start_time', 'desc')
            ->take(5)
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'type' => 'padel',
                    'title' => ($b->court?->name ?? 'بادل') . ' (بادل)',
                    'start_time' => $b->start_time,
                    'end_time' => $b->end_time,
                    'status' => $b->status,
                    'created_at' => $b->created_at,
                ];
            });

        $pastPilates = \App\Models\PilatesBooking::with('pilatesSession')
            ->where('user_id', $user->id)
            ->whereHas('pilatesSession', function ($q) {
                $q->where('session_date', '<', now()->toDateString());
            })
            ->orderBy('created_at', 'desc')
            ->take(5)
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
                    $status = 'approved';
                }
                
                return [
                    'id' => $pb->id,
                    'type' => 'pilates',
                    'title' => ($session->title ?? 'جلسة بيلاتس') . ' (بيلاتس)',
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'status' => $status,
                    'created_at' => $pb->created_at,
                ];
            });

        $recentActivities = $pastPadel->concat($pastPilates)
            ->sortByDesc('created_at')
            ->values();

        $stats['recent_activity'] = $recentActivities->take(5)->map(function ($activity) {
            return [
                'id' => $activity['id'],
                'title' => $activity['title'],
                'time' => $activity['created_at'] ? $activity['created_at']->locale('ar')->diffForHumans() : '',
                'status' => $activity['status'],
            ];
        })->toArray();

        // Total bookings count (Padel + Pilates)
        $totalPadel = \App\Models\Booking::where('user_id', $user->id)->count();
        $totalPilates = \App\Models\PilatesBooking::where('user_id', $user->id)->count();
        $stats['total_bookings'] = $totalPadel + $totalPilates;

        // Custom chart data: show Padel vs Pilates bookings count in the last 7 days
        $bookingsData = [];
        foreach ($last7Days as $date) {
            $dailyPadel = \App\Models\Booking::where('user_id', $user->id)
                ->whereDate('created_at', $date)
                ->count();
            
            $dailyPilates = \App\Models\PilatesBooking::where('user_id', $user->id)
                ->whereDate('created_at', $date)
                ->count();

            $dayName = \Carbon\Carbon::parse($date)
                ->locale('ar')
                ->translatedFormat('D');

            $bookingsData[] = [
                'date' => $dayName,
                'count' => $dailyPadel + $dailyPilates,
            ];
        }
        $stats['bookings_data'] = $bookingsData;
    }

    return Inertia::render('Dashboard', [
        'stats' => $stats,
        'isPlayer' => $user->hasRole('Player') && !$user->hasAnyRole(['Admin', 'Manager', 'Receptionist', 'Pilates Admin']),
    ]);
}

    
}
