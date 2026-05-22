<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlayerProfile;

class LeaderboardController extends Controller
{
    public function index()
    {
        $players = PlayerProfile::with(['user.eventRegistrations.event'])
            ->orderBy('points', 'desc')
            ->get()
            ->map(function ($profile, $index) {
                
                $events = [];
                if ($profile->user && $profile->user->eventRegistrations) {
                    foreach ($profile->user->eventRegistrations as $reg) {
                        if ($reg->event) {
                            $events[] = [
                                'id' => $reg->event->id,
                                'name' => $reg->event->title,
                                'title_ar' => $reg->event->title_ar,
                                'title_en' => $reg->event->title_en,
                                'status' => $reg->status,
                                'placement' => $reg->placement,
                                'start_date' => $reg->event->date ? $reg->event->date->toDateString() : null,
                            ];
                        }
                    }
                }

                return [
                    'rank' => $index + 1,
                    'user_name' => $profile->user ? $profile->user->name : 'Unknown',
                    'image_path' => $profile->user ? $profile->user->image_path : null,
                    'rank_level' => $profile->rank_level,
                    'points' => $profile->points,
                    'matches_won' => $profile->matches_won,
                    'matches_played' => $profile->matches_played,
                    'events' => $events,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $players
        ]);
    }
}
