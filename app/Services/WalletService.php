<?php

namespace App\Services;

use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Exception;

class WalletService
{
    /**
     * Add funds to a wallet.
     */
    public function deposit(Wallet $wallet, float $amount, string $description, ?int $createdBy = null): Transaction
    {
        if ($amount <= 0) {
            throw new Exception("Deposit amount must be greater than zero.");
        }

        return DB::transaction(function () use ($wallet, $amount, $description, $createdBy) {
            // Create the transaction record
            $transaction = $wallet->transactions()->create([
                'amount' => $amount,
                'type' => 'credit',
                'description' => $description,
                'created_by' => $createdBy,
            ]);

            // Update the wallet balance
            $wallet->balance += $amount;
            $wallet->save();

            return $transaction;
        });
    }

    /**
     * Deduct funds from a wallet.
     */
    public function deduct(Wallet $wallet, float $amount, string $description, ?int $createdBy = null): Transaction
    {
        if ($amount <= 0) {
            throw new Exception("Deduct amount must be greater than zero.");
        }

        if ($wallet->balance < $amount) {
            throw new Exception("Insufficient funds.");
        }

        return DB::transaction(function () use ($wallet, $amount, $description, $createdBy) {
            // Create the transaction record
            $transaction = $wallet->transactions()->create([
                'amount' => $amount,
                'type' => 'debit',
                'description' => $description,
                'created_by' => $createdBy,
            ]);

            // Update the wallet balance
            $wallet->balance -= $amount;
            $wallet->save();

            return $transaction;
        });
    }
}
