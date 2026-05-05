<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $events = Event::withCount(['registrations as is_registered' => function ($query) {
            if (auth()->check()) {
                $query->where('user_id', auth()->id());
            } else {
                $query->whereRaw('1 = 0');
            }
        }])
        ->whereIn('status', ['upcoming', 'ongoing', 'completed'])
        ->orderBy('date', 'desc')
        ->get();

        return inertia('Events', [
            'events' => $events
        ]);
    }

    public function show(Event $event)
    {
        $event->load(['registrations' => function ($query) {
            $query->where('status', 'approved')
                  ->with('user:id,name,image_path')
                  ->orderBy('placement', 'asc');
        }]);

        $is_registered = false;
        if (auth()->check()) {
            $is_registered = \App\Models\EventRegistration::where('event_id', $event->id)
                ->where('user_id', auth()->id())
                ->exists();
        }

        return inertia('EventDetails', [
            'event' => $event,
            'is_registered' => $is_registered
        ]);
    }

    public function register(Request $request, Event $event)
    {
        if (!auth()->check()) {
            return back()->with('error', 'يجب تسجيل الدخول للتسجيل في الفعالية.');
        }

        // Check if already registered
        $existingRegistration = \App\Models\EventRegistration::where('event_id', $event->id)
            ->where('user_id', auth()->id())
            ->first();

        if ($existingRegistration) {
            return back()->with('error', 'أنت مسجل بالفعل في هذه الفعالية.');
        }

        \App\Models\EventRegistration::create([
            'event_id' => $event->id,
            'user_id' => auth()->id(),
            'status' => 'pending'
        ]);

        return back()->with('success', 'تم تسجيل طلبك بنجاح. سنقوم بمراجعته قريباً.');
    }

    public function cancelRegistration(Request $request, Event $event)
    {
        if (!auth()->check()) {
            return back()->with('error', 'يجب تسجيل الدخول لإلغاء التسجيل.');
        }

        $registration = \App\Models\EventRegistration::where('event_id', $event->id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$registration) {
            return back()->with('error', 'لم يتم العثور على تسجيل لهذه الفعالية.');
        }

        $registration->delete();

        return back()->with('success', 'تم إلغاء التسجيل بنجاح.');
    }
}
