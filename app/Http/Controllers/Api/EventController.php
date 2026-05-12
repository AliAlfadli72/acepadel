<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::withCount('registrations')->orderBy('date', 'asc')->get();

        $formattedEvents = $events->map(function ($event) {
            return [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->desc,
                'date' => $event->date ? $event->date->format('Y-m-d') : null,
                'start_time' => $event->time ? $event->time->format('H:i') : '00:00',
                'end_time' => $event->time ? $event->time->copy()->addHours(2)->format('H:i') : '02:00', // Mocking end_time for now
                'price' => $event->fee,
                'max_participants' => $event->max_participants,
                'current_participants' => $event->registrations_count,
                'status' => $event->status ?? 'upcoming',
                'type' => $event->category ?? 'tournament', // tournament, training, social
                'image_url' => $event->image_path ? asset('storage/' . $event->image_path) : null,
                'prize' => $event->prize,
                'level' => $event->level,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $formattedEvents
        ]);
    }
}
