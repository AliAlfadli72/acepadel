<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlayerController extends Controller
{
public function index(Request $request)
{
    $search = $request->search;

    /*
    |--------------------------------------------------------------------------
    | Base Query
    |--------------------------------------------------------------------------
    */

    $baseQuery = User::query()
        ->whereHas('playerProfile')
        ->with('playerProfile');

    /*
    |--------------------------------------------------------------------------
    | Top Players
    |--------------------------------------------------------------------------
    */

    $topPlayers = (clone $baseQuery)
        ->join('player_profiles', 'users.id', '=', 'player_profiles.user_id')
        ->orderByDesc('player_profiles.points')
        ->select('users.*')
        ->distinct()
        ->take(5)
        ->get();

    /*
    |--------------------------------------------------------------------------
    | Excluded IDs
    |--------------------------------------------------------------------------
    */

    $topPlayerIds = $topPlayers->pluck('id');

    /*
    |--------------------------------------------------------------------------
    | Players List
    |--------------------------------------------------------------------------
    */
    $players = (clone $baseQuery)

    /*
    |--------------------------------------------------------------------------
    | Hide Top Players ONLY When No Search
    |--------------------------------------------------------------------------
    */

    ->when(!$search, function ($query) use ($topPlayerIds) {

        $query->whereNotIn('users.id', $topPlayerIds);
    })

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    ->when($search, function ($query) use ($search) {

        $query->where(function ($q) use ($search) {

            $q->where('name', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
                ->orWhereHas('playerProfile', function ($pq) use ($search) {

                    $pq->where('rank_level', 'like', "%{$search}%");
                });
        });
    })

    /*
    |--------------------------------------------------------------------------
    | Ranking Order
    |--------------------------------------------------------------------------
    */

    ->join('player_profiles', 'users.id', '=', 'player_profiles.user_id')
    ->orderByDesc('player_profiles.points')
    ->select('users.*')

    ->paginate(12)
    ->withQueryString();



    return Inertia::render('Players', [
        'players' => $players,
        'topPlayers' => $topPlayers,
        'showTopPlayers' => $topPlayers->count() >= 5,
        'filters' => [
            'search' => $search,
        ],
    ]);
}
}