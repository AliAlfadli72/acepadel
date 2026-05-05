<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminFinanceController extends Controller
{
    public function index(Request $request)
    {
        // 1. Total wallet balances
        $totalWalletsBalance = Wallet::sum('balance');

        // 2. Total deposits
        $totalDeposits = Transaction::where('type', 'deposit')->sum('amount');
        
        // 3. Total deductions
        $totalDeductions = Transaction::where('type', 'deduction')->sum('amount');

        // 4. Total booking revenue (approved and completed)
        $totalBookingsRevenue = Booking::whereIn('status', ['approved', 'completed'])->sum('total_price');

        // Chart Data: Last 30 Days
        $now = \Carbon\Carbon::now();
        $last30Days = collect(range(29, 0))->map(function($day) use ($now) {
            return $now->copy()->subDays($day)->format('Y-m-d');
        });

        $chartData = [];
        foreach ($last30Days as $date) {
            $dailyBookingsRevenue = Booking::whereDate('created_at', $date)
                ->whereIn('status', ['approved', 'completed'])
                ->sum('total_price');

            $dailyDeposits = Transaction::where('type', 'deposit')
                ->whereDate('created_at', $date)
                ->sum('amount');

            $chartData[] = [
                'date'     => $date, // Pass raw date to frontend for formatting
                'revenue'  => $dailyBookingsRevenue,
                'deposits' => $dailyDeposits,
            ];
        }

        // 5. Transactions history with pagination and filters
        $query = Transaction::with(['wallet.user', 'creator'])->orderByDesc('created_at');
        
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->whereHas('wallet.user', function($qu) use ($s) {
                    $qu->where('name', 'like', "%$s%")->orWhere('phone', 'like', "%$s%");
                })->orWhere('description', 'like', "%$s%");
            });
        }

        $transactions = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Finances/Index', [
            'transactions' => $transactions,
            'stats' => [
                'total_wallets_balance' => $totalWalletsBalance,
                'total_deposits'        => $totalDeposits,
                'total_deductions'      => $totalDeductions,
                'total_bookings_revenue'=> $totalBookingsRevenue,
            ],
            'chart_data' => $chartData,
            'filters' => $request->only(['type', 'search']),
        ]);
    }
}
