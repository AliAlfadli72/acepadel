<?php

namespace App\Observers;

use App\Models\User;
use App\Models\Wallet;
use App\Models\PlayerProfile;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        /*
        |------------------------------------------------------------------
        | Automatically create wallet
        |------------------------------------------------------------------
        */

        Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0]
        );

        /*
        |------------------------------------------------------------------
        | Automatically create player profile
        |------------------------------------------------------------------
        */

        PlayerProfile::firstOrCreate(
            ['user_id' => $user->id],
            [
                'rank_level' => 'Beginner',
                'points' => 0,
                'matches_played' => 0,
                'matches_won' => 0,
            ]
        );
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        //
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        //
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        //
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        //
    }
}