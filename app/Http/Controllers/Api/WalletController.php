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
                'message' => app()->getLocale() === 'en' ? 'Wallet not found for this user.' : 'المحفظة غير موجودة لهذا المستخدم.'
            ], 404);
        }

        $transactions = Transaction::where('wallet_id', $wallet->id)->orderBy('created_at', 'desc')->get();

        $locale = app()->getLocale();
        $transactions->each(function ($tx) use ($locale) {
            $tx->description = $this->translateDescription($tx->description, $locale);
        });

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
                'message' => app()->getLocale() === 'en' ? 'Wallet not found for this user.' : 'المحفظة غير موجودة لهذا المستخدم.'
            ], 404);
        }

        $transactions = Transaction::where('wallet_id', $wallet->id)->orderBy('created_at', 'desc')->get();

        $locale = app()->getLocale();
        $transactions->each(function ($tx) use ($locale) {
            $tx->description = $this->translateDescription($tx->description, $locale);
        });

        return response()->json([
            'status' => 'success',
            'data' => $transactions
        ]);
    }

    /**
     * Translates a transaction description dynamically to English if locale is 'en'.
     */
    private function translateDescription($description, $locale)
    {
        if ($locale !== 'en') {
            return $description;
        }

        $translations = [
            'شحن رصيد المحفظة' => 'Wallet deposit top-up',
            'تعديل رصيد بيلاتس يدوي' => 'Pilates wallet manual adjustment',
            'رصيد مجاني' => 'Free credit bonus',
            'شحن رصيد' => 'Wallet top-up',
        ];

        if (isset($translations[$description])) {
            return $translations[$description];
        }

        $translated = $description;

        // 1. Pilates Package Purchase
        if (str_contains($translated, 'شراء باقة بيلاتس:')) {
            $translated = str_replace('شراء باقة بيلاتس:', 'Purchase Pilates Package:', $translated);
            $translated = preg_replace('/باقة\s+(\d+)\s+كلاس(ات)?/u', '$1-Class Package', $translated);
            $translated = str_replace('باقة', 'Package', $translated);
            $translated = str_replace('كلاسات', 'Classes', $translated);
            $translated = str_replace('كلاس', 'Classes', $translated);
        }

        // 2. Book Pilates Session
        if (str_contains($translated, 'حجز جلسة بيلاتس')) {
            $translated = str_replace('حجز جلسة بيلاتس', 'Book Pilates Session', $translated);
        }

        // 3. Event Refunds
        if (str_contains($translated, 'استرجاع رسوم فعالية')) {
            $translated = str_replace('استرجاع رسوم فعالية', 'Refund Event Fee', $translated);
        }

        // 4. Event registration fee
        if (str_contains($translated, 'رسوم التسجيل في فعالية')) {
            $translated = str_replace('رسوم التسجيل في فعالية', 'Registration Fee for Event', $translated);
        }

        // 5. Padel Booking
        if (str_contains($translated, 'حجز ملعب بادل')) {
            $translated = str_replace('حجز ملعب بادل', 'Padel Court Booking', $translated);
        }

        // 6. Padel Booking Refund
        if (str_contains($translated, 'استرجاع رصيد حجز ملعب')) {
            $translated = str_replace('استرجاع رصيد حجز ملعب', 'Court Booking Refund', $translated);
        }

        // 7. Manual Padel Balance Adjustment
        if (str_contains($translated, 'تعديل رصيد يدوي')) {
            $translated = str_replace('تعديل رصيد يدوي', 'Manual Balance Adjustment', $translated);
        }

        return $translated;
    }
}
