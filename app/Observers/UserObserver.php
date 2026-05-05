<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // Automatically create a wallet
        $user->wallet()->create([
            'balance' => 0,
        ]);

        // Automatically create a player profile
        $user->playerProfile()->create([
            'rank_level' => 'Beginner',
            'points' => 0,
            'matches_played' => 0,
            'matches_won' => 0,
        ]);
        
        // Assign default Player role if not assigned
        if (!$user->hasAnyRole(\Spatie\Permission\Models\Role::all())) {
            $user->assignRole('Player');
        }
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
