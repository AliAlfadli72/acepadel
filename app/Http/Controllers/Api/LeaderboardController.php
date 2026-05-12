<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlayerProfile;

class LeaderboardController extends Controller
{
    public function index()
    {
        $players = PlayerProfile::with('user:id,name,image_path')
            ->orderBy('points', 'desc')
            ->get()
            ->map(function ($profile, $index) {
                return [
                    'rank' => $index + 1,
                    'user_name' => $profile->user ? $profile->user->name : 'Unknown',
                    'image_path' => $profile->user ? $profile->user->image_path : null,
                    'rank_level' => $profile->rank_level,
                    'points' => $profile->points,
                    'matches_won' => $profile->matches_won,
                    'matches_played' => $profile->matches_played,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $players
        ]);
    }
}
