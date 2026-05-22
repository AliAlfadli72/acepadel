<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use App\Models\Expense;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\Booking;
use App\Models\Event;


class AdminFinanceController extends Controller
{
    public function index(Request $request)
{
    /*
    |--------------------------------------------------------------------------
    | Selected Month & Year
    |--------------------------------------------------------------------------
    */

    $selectedMonth = $request->month ?? 'all';

    $selectedYear = $request->year
        ? (int) $request->year
        : now()->year;

    $currentYear = now()->year;
    $currentMonth = now()->month;

    /*
    |--------------------------------------------------------------------------
    | Prevent Future Dates
    |--------------------------------------------------------------------------
    */

    if ($selectedMonth !== 'all') {

        $selectedMonth = (int) $selectedMonth;

        if (
            $selectedYear > $currentYear
            || (
                $selectedYear == $currentYear
                && $selectedMonth > $currentMonth
            )
        ) {

            $selectedMonth = $currentMonth;
            $selectedYear = $currentYear;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Date Range
    |--------------------------------------------------------------------------
    */

    if ($selectedMonth === 'all') {

        $startDate = Carbon::create(
            $selectedYear,
            1,
            1
        )->startOfYear();

        $endDate = Carbon::create(
            $selectedYear,
            12,
            31
        )->endOfYear();

    } else {

        $startDate = Carbon::create(
            $selectedYear,
            $selectedMonth,
            1
        )->startOfMonth();

        $endDate = $startDate
            ->copy()
            ->endOfMonth();
    }

    /*
    |--------------------------------------------------------------------------
    | Wallet Balances
    |--------------------------------------------------------------------------
    */

    $totalWalletsBalance = Wallet::sum('balance');

    /*
    |--------------------------------------------------------------------------
    | Deposits
    |--------------------------------------------------------------------------
    */

    $totalDeposits = Transaction::where('type', 'credit')
        ->where(fn($q) => $q->whereNull('reference_type')->orWhere('reference_type', '!=', Booking::class))
        ->whereBetween('created_at', [
            $startDate,
            $endDate,
        ])
        ->sum('amount');

    /*
    |--------------------------------------------------------------------------
    | Booking + Event Revenue
    |--------------------------------------------------------------------------
    */

    $totalBookingsRevenue = Transaction::where('type', 'debit')
        ->whereIn('reference_type', [
            Booking::class,
            Event::class,
        ])
        ->whereBetween('created_at', [
            $startDate,
            $endDate,
        ])
        ->sum('amount');

    /*
    |--------------------------------------------------------------------------
    | Refunds
    |--------------------------------------------------------------------------
    */

    $totalRefunds = Transaction::where('type', 'credit')
        ->where('reference_type', Booking::class)
        ->whereBetween('created_at', [
            $startDate,
            $endDate,
        ])
        ->sum('amount');

    /*
    |--------------------------------------------------------------------------
    | Manual Adjustments
    |--------------------------------------------------------------------------
    */

    $totalManualAdjustments = Transaction::where('type', 'debit')
        ->where(fn($q) => $q->whereNull('reference_type')->orWhereNotIn('reference_type', [
            Booking::class,
            Event::class,
        ]))
        ->whereBetween('created_at', [
            $startDate,
            $endDate,
        ])
        ->sum('amount');

    /*
    |--------------------------------------------------------------------------
    | Wallet Deductions
    |--------------------------------------------------------------------------
    */

    $totalWalletDeductions = Transaction::where('type', 'debit')
        ->whereBetween('created_at', [
            $startDate,
            $endDate,
        ])
        ->sum('amount');

    /*
    |--------------------------------------------------------------------------
    | Expenses Query
    |--------------------------------------------------------------------------
    */

    $expensesQuery = Expense::query()

        ->where(function ($query) use (
            $startDate,
            $endDate
        ) {

            /*
            |--------------------------------------------------------------------------
            | One Time Expenses
            |--------------------------------------------------------------------------
            */

            $query->where(function ($q) use (
                $startDate,
                $endDate
            ) {

                $q->where('type', 'one_time')

                    ->whereBetween('expense_date', [
                        $startDate,
                        $endDate,
                    ]);
            })

            /*
            |--------------------------------------------------------------------------
            | Recurring Expenses
            |--------------------------------------------------------------------------
            */

            ->orWhere(function ($q) use (
                $startDate,
                $endDate
            ) {

                $q->whereIn('type', [
                        'monthly',
                        'yearly',
                    ])

                    ->whereDate(
                        'starts_at',
                        '<=',
                        $endDate
                    )

                    ->where(function ($sub) use (
                        $startDate
                    ) {

                        $sub->whereNull('ends_at')

                            ->orWhereDate(
                                'ends_at',
                                '>=',
                                $startDate
                            );
                    });
            });
        });

    /*
    |--------------------------------------------------------------------------
    | Total Expenses
    |--------------------------------------------------------------------------
    */

    $totalExpenses = (clone $expensesQuery)
        ->sum('amount');

    /*
    |--------------------------------------------------------------------------
    | Net Revenue
    |--------------------------------------------------------------------------
    */

    $netRevenue =
        $totalBookingsRevenue
        - $totalRefunds
        - $totalManualAdjustments
        - $totalExpenses;

    /*
    |--------------------------------------------------------------------------
    | Chart Data
    |--------------------------------------------------------------------------
    */

    $chartData = [];

    /*
    |--------------------------------------------------------------------------
    | Full Year Chart
    |--------------------------------------------------------------------------
    */

    if ($selectedMonth === 'all') {

        for ($month = 1; $month <= 12; $month++) {

            $monthStart = Carbon::create(
                $selectedYear,
                $month,
                1
            )->startOfMonth();

            $monthEnd = $monthStart
                ->copy()
                ->endOfMonth();

            $monthlyRevenue = Transaction::where('type', 'debit')
                ->whereIn('reference_type', [
                    Booking::class,
                    Event::class,
                ])
                ->whereBetween('created_at', [
                    $monthStart,
                    $monthEnd,
                ])
                ->sum('amount');

            $monthlyDeposits = Transaction::where('type', 'credit')
                ->where(fn($q) => $q->whereNull('reference_type')->orWhere('reference_type', '!=', Booking::class))
                ->whereBetween('created_at', [
                    $monthStart,
                    $monthEnd,
                ])
                ->sum('amount');

            $monthlyRefunds = Transaction::where('type', 'credit')
                ->where('reference_type', Booking::class)
                ->whereBetween('created_at', [
                    $monthStart,
                    $monthEnd,
                ])
                ->sum('amount');

            $monthlyExpenses = Expense::query()

                ->where(function ($query) use (
                    $monthStart,
                    $monthEnd
                ) {

                    $query->where(function ($q) use (
                        $monthStart,
                        $monthEnd
                    ) {

                        $q->where('type', 'one_time')

                            ->whereBetween(
                                'expense_date',
                                [
                                    $monthStart,
                                    $monthEnd,
                                ]
                            );
                    })

                    ->orWhere(function ($q) use (
                        $monthStart,
                        $monthEnd
                    ) {

                        $q->whereIn('type', [
                                'monthly',
                                'yearly',
                            ])

                            ->whereDate(
                                'starts_at',
                                '<=',
                                $monthEnd
                            )

                            ->where(function ($sub) use (
                                $monthStart
                            ) {

                                $sub->whereNull('ends_at')

                                    ->orWhereDate(
                                        'ends_at',
                                        '>=',
                                        $monthStart
                                    );
                            });
                    });
                })

                ->sum('amount');

            $chartData[] = [

                'date' => $monthStart->translatedFormat('F'),

                'revenue' => $monthlyRevenue,

                'deposits' => $monthlyDeposits,

                'refunds' => $monthlyRefunds,

                'expenses' => $monthlyExpenses,

                'net' =>
                    $monthlyRevenue
                    - $monthlyRefunds
                    - $monthlyExpenses,
            ];
        }

    } else {

        /*
        |--------------------------------------------------------------------------
        | Monthly Chart
        |--------------------------------------------------------------------------
        */

        $days = collect(
            range(1, $endDate->day)
        )->map(function ($day) use (
            $selectedYear,
            $selectedMonth
        ) {

            return Carbon::create(
                $selectedYear,
                $selectedMonth,
                $day
            )->format('Y-m-d');
        });

        foreach ($days as $date) {

            $dailyRevenue = Transaction::where('type', 'debit')
                ->whereIn('reference_type', [
                    Booking::class,
                    Event::class,
                ])
                ->whereDate('created_at', $date)
                ->sum('amount');

            $dailyDeposits = Transaction::where('type', 'credit')
                ->where(fn($q) => $q->whereNull('reference_type')->orWhere('reference_type', '!=', Booking::class))
                ->whereDate('created_at', $date)
                ->sum('amount');

            $dailyRefunds = Transaction::where('type', 'credit')
                ->where('reference_type', Booking::class)
                ->whereDate('created_at', $date)
                ->sum('amount');

            $dailyExpenses = Expense::query()

                ->where(function ($query) use ($date) {

                    $query->where(function ($q) use ($date) {

                        $q->where('type', 'one_time')

                            ->whereDate(
                                'expense_date',
                                $date
                            );
                    })

                    ->orWhere(function ($q) use ($date) {

                        $q->whereIn('type', [
                                'monthly',
                                'yearly',
                            ])

                            ->whereDate(
                                'starts_at',
                                '<=',
                                $date
                            )

                            ->where(function ($sub) use (
                                $date
                            ) {

                                $sub->whereNull('ends_at')

                                    ->orWhereDate(
                                        'ends_at',
                                        '>=',
                                        $date
                                    );
                            });
                    });
                })

                ->sum('amount');

            $chartData[] = [

                'date' => $date,

                'revenue' => $dailyRevenue,

                'deposits' => $dailyDeposits,

                'refunds' => $dailyRefunds,

                'expenses' => $dailyExpenses,

                'net' =>
                    $dailyRevenue
                    - $dailyRefunds
                    - $dailyExpenses,
            ];
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Transactions Query
    |--------------------------------------------------------------------------
    */

    $query = Transaction::with([
            'wallet.user',
            'creator',
        ])
        ->whereBetween('created_at', [
            $startDate,
            $endDate,
        ])
        ->latest();

    /*
    |--------------------------------------------------------------------------
    | Type Filter
    |--------------------------------------------------------------------------
    */

    if (
        $request->filled('type')
        && $request->type !== 'all'
    ) {
        if ($request->type === 'deposit') {
            $query->where('type', 'credit')
                  ->where(fn($q) => $q->whereNull('reference_type')->orWhere('reference_type', '!=', Booking::class));
        } elseif ($request->type === 'booking_payment') {
            $query->where('type', 'debit')
                  ->where('reference_type', Booking::class);
        } elseif ($request->type === 'event_payment') {
            $query->where('type', 'debit')
                  ->where('reference_type', Event::class);
        } elseif ($request->type === 'refund') {
            $query->where('type', 'credit')
                  ->where('reference_type', Booking::class);
        } elseif ($request->type === 'manual_adjustment') {
            $query->where('type', 'debit')
                  ->where(fn($q) => $q->whereNull('reference_type')->orWhereNotIn('reference_type', [
                      Booking::class,
                      Event::class,
                  ]));
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    if ($request->filled('search')) {

        $search = $request->search;

        $query->where(function ($q) use ($search) {

            $q->whereHas(
                'wallet.user',
                function ($qu) use ($search) {

                    $qu->where(
                            'name',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'phone',
                            'like',
                            "%{$search}%"
                        );
                }
            )

            ->orWhere(
                'description',
                'like',
                "%{$search}%"
            );
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

    $transactions = $query
        ->paginate(15)
        ->withQueryString()
        ->through(function ($transaction) {
            $logicalType = 'deposit';
            if ($transaction->type === 'credit') {
                if ($transaction->reference_type === Booking::class) {
                    $logicalType = 'refund';
                } else {
                    $logicalType = 'deposit';
                }
            } else { // debit
                if ($transaction->reference_type === Booking::class) {
                    $logicalType = 'booking_payment';
                } elseif ($transaction->reference_type === Event::class) {
                    $logicalType = 'event_payment';
                } else {
                    $logicalType = 'manual_adjustment';
                }
            }
            $transaction->type = $logicalType;
            return $transaction;
        });

    /*
    |--------------------------------------------------------------------------
    | Expenses List
    |--------------------------------------------------------------------------
    */

    $expenses = (clone $expensesQuery)
        ->latest()
        ->get();

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return Inertia::render(
        'Admin/Finances/Index',
        [

            'transactions' => $transactions,

            'expenses' => $expenses,

            'stats' => [

                'total_wallets_balance' =>
                    $totalWalletsBalance,

                'total_deposits' =>
                    $totalDeposits,

                'total_bookings_revenue' =>
                    $totalBookingsRevenue,

                'total_refunds' =>
                    $totalRefunds,

                'total_manual_adjustments' =>
                    $totalManualAdjustments,

                'total_wallet_deductions' =>
                    $totalWalletDeductions,

                'total_expenses' =>
                    $totalExpenses,

                'net_revenue' =>
                    $netRevenue,
            ],

            'chart_data' => $chartData,

            'filters' => [

                'type' => $request->type,

                'search' => $request->search,

                'month' => $selectedMonth,

                'year' => $selectedYear,
            ],
        ]
    );
}



    public function storeExpense(Request $request)
    {
        $validated = $request->validate([

            'title' => 'required|string|max:255',

            'description' => 'nullable|string',

            'category' => 'required|in:rent,salary,utilities,maintenance,equipment,marketing,subscription,tournament,supplies,miscellaneous',

            'type' => 'required|in:one_time,monthly,yearly',

            'amount' => 'required|numeric|min:0',

            'expense_date' => 'nullable|date',

            'starts_at' => 'nullable|date',

            'ends_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        /*
        |--------------------------------------------------------------------------
        | One Time Expense
        |--------------------------------------------------------------------------
        */

        if ($validated['type'] === 'one_time') {

            $validated['expense_date'] =
                $validated['expense_date']
                ?? now()->toDateString();

            $validated['starts_at'] = null;
            $validated['ends_at'] = null;
        }

        /*
        |--------------------------------------------------------------------------
        | Recurring Expense
        |--------------------------------------------------------------------------
        */

        if (
            $validated['type'] === 'monthly'
            || $validated['type'] === 'yearly'
        ) {

            $validated['starts_at'] =
                $validated['starts_at']
                ?? now()->toDateString();

            $validated['expense_date'] = null;
        }

        /*
        |--------------------------------------------------------------------------
        | Create Expense
        |--------------------------------------------------------------------------
        */

        Expense::create([

            'title' => $validated['title'],

            'description' => $validated['description'] ?? null,

            'category' => $validated['category'],

            'type' => $validated['type'],

            'amount' => $validated['amount'],

            'expense_date' => $validated['expense_date'] ?? null,

            'starts_at' => $validated['starts_at'] ?? null,

            'ends_at' => $validated['ends_at'] ?? null,

            'active' => true,

            'created_by' => auth()->id(),
        ]);

        return back()->with(
            'success',
            'تم إضافة المصروف بنجاح.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | End Expense
    |--------------------------------------------------------------------------
    */

    public function endExpense(Expense $expense)
    {
        $expense->update([

            'active' => false,

            'ends_at' => now()->toDateString(),
        ]);

        return back()->with(
            'success',
            'تم إنهاء المصروف بنجاح.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Expense
    |--------------------------------------------------------------------------
    */

    public function deleteExpense(Expense $expense)
    {
        $expense->delete();

        return back()->with(
            'success',
            'تم حذف المصروف بنجاح.'
        );
    }
}