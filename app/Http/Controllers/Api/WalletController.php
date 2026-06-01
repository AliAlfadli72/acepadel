<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function show(Request $request)
    {
        $userId = $request->user()->id;

        $wallet = Wallet::where('user_id', $userId)->first();

        if (!$wallet) {
            return response()->json([
                'status' => 'error',
                'message' => 'المحفظة غير موجودة لهذا المستخدم.'
            ], 404);
        }

        $transactions = Transaction::where('wallet_id', $wallet->id)->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'balance' => $wallet->balance,
                'pilates_balance' => $wallet->pilates_balance ?? 0.00
            ],
            'transactions' => $transactions
        ]);
    }

    public function transactions(Request $request)
    {
        $userId = $request->user()->id;

        $wallet = Wallet::where('user_id', $userId)->first();

        if (!$wallet) {
            return response()->json([
                'status' => 'error',
                'message' => 'المحفظة غير موجودة لهذا المستخدم.'
            ], 404);
        }

        $transactions = Transaction::where('wallet_id', $wallet->id)->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $transactions
        ]);
    }
}
