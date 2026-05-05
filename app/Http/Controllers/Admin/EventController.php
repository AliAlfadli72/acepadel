<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $events = \App\Models\Event::with(['registrations.user'])->withCount(['registrations', 'registrations as approved_registrations_count' => function ($query) {
            $query->where('status', 'approved');
        }])->latest()->get();

        $stats = [
            'total_events' => $events->count(),
            'upcoming_events' => $events->where('status', 'upcoming')->count(),
            'total_participants' => $events->sum('approved_registrations_count'),
            'total_revenue' => $events->sum(function ($event) {
                return $event->fee * $event->approved_registrations_count;
            }),
        ];

        return inertia('Admin/Events/Index', [
            'events' => $events,
            'stats' => $stats
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title_ar' => 'required|string|max:255',
            'title_en' => 'required|string|max:255',
            'desc_ar' => 'required|string',
            'desc_en' => 'required|string',
            'category' => 'required|in:Tournament,Cup,Event',
            'level' => 'required|in:Open,Advanced,All Levels,Juniors',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required',
            'fee' => 'required|numeric|min:0',
            'prize_ar' => 'nullable|string|max:255',
            'prize_en' => 'nullable|string|max:255',
            'max_participants' => 'required|integer|min:0',
            'color_class' => 'nullable|string|max:50',
            'image' => 'nullable|image|max:10240',
            'status' => 'required|in:upcoming,ongoing,completed',
        ]);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('events', 'public');
        }

        \App\Models\Event::create($validated);

        return back()->with('success', 'تم إنشاء الفعالية بنجاح.');
    }

    public function update(Request $request, string $id)
    {
        $event = \App\Models\Event::findOrFail($id);

        $validated = $request->validate([
            'title_ar' => 'required|string|max:255',
            'title_en' => 'required|string|max:255',
            'desc_ar' => 'required|string',
            'desc_en' => 'required|string',
            'category' => 'required|in:Tournament,Cup,Event',
            'level' => 'required|in:Open,Advanced,All Levels,Juniors',
            'date' => 'required|date',
            'time' => 'required',
            'fee' => 'required|numeric|min:0',
            'prize_ar' => 'nullable|string|max:255',
            'prize_en' => 'nullable|string|max:255',
            'max_participants' => 'required|integer|min:0',
            'color_class' => 'nullable|string|max:50',
            'image' => 'nullable|image|max:10240',
            'status' => 'required|in:upcoming,ongoing,completed',
        ]);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('events', 'public');
        }

        $event->update($validated);

        return back()->with('success', 'تم تحديث الفعالية بنجاح.');
    }

    public function destroy(string $id)
    {
        $event = \App\Models\Event::findOrFail($id);
        $event->delete();

        return back()->with('success', 'تم حذف الفعالية بنجاح.');
    }

    public function registrations(string $id)
    {
        $event = \App\Models\Event::with(['registrations.user'])->findOrFail($id);
        return response()->json($event->registrations);
    }

    public function updateRegistrationStatus(\Illuminate\Http\Request $request, string $eventId, string $registrationId)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $registration = \App\Models\EventRegistration::where('event_id', $eventId)->findOrFail($registrationId);
        $registration->update(['status' => $request->status]);

        $message = $request->status === 'approved' ? 'تمت الموافقة على طلب التسجيل.' : 'تم رفض طلب التسجيل.';
        return back()->with('success', $message);
    }

    public function show(string $id)
    {
        $event = \App\Models\Event::with(['registrations.user'])->findOrFail($id);
        
        return inertia('Admin/Events/Show', [
            'event' => $event
        ]);
    }

    public function updatePlacement(\Illuminate\Http\Request $request, string $eventId, string $registrationId)
    {
        $request->validate([
            'placement' => 'nullable|integer|min:1|max:10',
        ]);

        $registration = \App\Models\EventRegistration::where('event_id', $eventId)
            ->where('status', 'approved') // Only approved players can get a placement
            ->findOrFail($registrationId);
            
        $registration->update(['placement' => $request->placement]);

        return back()->with('success', 'تم تحديث المركز بنجاح.');
    }

    public function updateEventStatus(\Illuminate\Http\Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|in:upcoming,ongoing,completed',
        ]);

        $event = \App\Models\Event::findOrFail($id);
        $event->update(['status' => $request->status]);

        return back()->with('success', 'تم تحديث حالة الفعالية بنجاح.');
    }
}
