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

    } else {

        /*
        |--------------------------------------------------------------------------
        | Player Dashboard
        |--------------------------------------------------------------------------
        */

        $stats['total_bookings'] =
            $user
                ? $user->bookings()->count()
                : 0;

        $stats['wallet_balance'] =
            ($user && $user->wallet)
                ? $user->wallet->balance
                : 0;

        $stats['upcoming_matches'] =
            $user
                ? $user->bookings()
                    ->whereIn('status', [
                        'approved',
                        'pending',
                    ])
                    ->where(
                        'start_time',
                        '>',
                        now()
                    )
                    ->count()
                : 0;

        $bookingsData = [];

        foreach ($last7Days as $date) {

            $dailyBookingsCount =
                $user
                    ? $user->bookings()
                        ->whereDate(
                            'created_at',
                            $date
                        )
                        ->count()
                    : 0;

            $dayName =
                \Carbon\Carbon::parse($date)
                    ->locale('ar')
                    ->translatedFormat('D');

            $bookingsData[] = [

                'date' => $dayName,

                'count' => $dailyBookingsCount,
            ];
        }

        $stats['bookings_data'] =
            $bookingsData;

        $stats['recent_activity'] =
            clone collect(

                $user

                ? $user->bookings()
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(function ($b) {

                        return [

                            'id' => $b->id,

                            'title' =>
                                'حجز ملعب '
                                .
                                $b->court_id,

                            'time' =>
                                $b->created_at
                                    ->locale('ar')
                                    ->diffForHumans(),

                            'status' =>
                                $b->status,
                        ];
                    })

                : []
            );
    }

    return Inertia::render('Dashboard', [

        'stats' => $stats,
    ]);
}

    
}
