<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\WalletService;
use App\Models\Wallet;
use Inertia\Inertia;

class WalletController extends Controller
{
    protected WalletService $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }

    /**
     * Show the current user's wallet.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Auto-create wallet if missing (safety net)
        if (!$user->wallet) {
            $user->wallet()->create(['balance' => 0]);
            $user->refresh();
        }

        $wallet = $user->wallet;
        $transactions = $wallet->transactions()->latest()->get();

        return Inertia::render('Wallet/Index', [
            'wallet'       => $wallet,
            'transactions' => $transactions,
        ]);
    }

    /**
     * Add funds to a wallet — Admin/Receptionist only.
     */
    public function deposit(Request $request, Wallet $wallet)
    {
        // Only Admin or Receptionist can add funds
        $user = Auth::user();
        if (!$user->hasAnyRole(['Admin', 'Receptionist'])) {
            abort(403, 'غير مصرح لك بإضافة رصيد.');
        }

        $request->validate([
            'amount'      => 'required|numeric|min:1',
            'description' => 'required|string|max:255',
        ], [
            'amount.required'      => 'يرجى إدخال المبلغ.',
            'amount.numeric'       => 'يجب أن يكون المبلغ رقماً.',
            'amount.min'           => 'يجب أن يكون المبلغ أكبر من صفر.',
            'description.required' => 'يرجى إدخال سبب الإيداع.',
        ]);

        try {
            $this->walletService->deposit(
                $wallet,
                (float) $request->amount,
                $request->description,
                $user->id
            );

            return redirect()->back()->with('success', 'تم إضافة الرصيد بنجاح.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Deduct funds from a wallet — Admin only.
     */
    public function deduct(Request $request, Wallet $wallet)
    {
        $user = Auth::user();
        if (!$user->hasRole('Admin')) {
            abort(403, 'غير مصرح لك بخصم الرصيد.');
        }

        $request->validate([
            'amount'      => 'required|numeric|min:1',
            'description' => 'required|string|max:255',
        ], [
            'amount.required'      => 'يرجى إدخال المبلغ.',
            'amount.min'           => 'يجب أن يكون المبلغ أكبر من صفر.',
            'description.required' => 'يرجى إدخال سبب الخصم.',
        ]);

        try {
            $this->walletService->deduct(
                $wallet,
                (float) $request->amount,
                $request->description,
                $user->id
            );

            return redirect()->back()->with('success', 'تم خصم الرصيد بنجاح.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
