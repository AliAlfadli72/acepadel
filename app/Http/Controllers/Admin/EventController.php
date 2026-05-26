<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\ImageUploadService;
class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search   = $request->input('search');
        $status   = $request->input('status');
        $category = $request->input('category');
        $level    = $request->input('level');

        // Stats should reflect global (unfiltered) events
        $allEvents = \App\Models\Event::withCount(['registrations as approved_registrations_count' => function ($query) {
            $query->where('status', 'approved');
        }])->get();

        $stats = [
            'total_events' => $allEvents->count(),
            'upcoming_events' => $allEvents->where('status', 'upcoming')->count(),
            'total_participants' => $allEvents->sum('approved_registrations_count'),
            'total_revenue' => $allEvents->sum(function ($event) {
                return $event->fee * $event->approved_registrations_count;
            }),
        ];

        // Filtered events query
        $eventsQuery = \App\Models\Event::with(['registrations.user'])
            ->withCount([
                'registrations',
                'registrations as approved_registrations_count' => function ($query) {
                    $query->where('status', 'approved');
                },
                'registrations as pending_registrations_count' => function ($query) {
                    $query->where('status', 'pending');
                }
            ]);

        $eventsQuery->when($search, function ($q) use ($search) {
            $q->where(function ($q2) use ($search) {
                $q2->where('title_ar', 'like', "%{$search}%")
                   ->orWhere('title_en', 'like', "%{$search}%")
                   ->orWhere('desc_ar', 'like', "%{$search}%")
                   ->orWhere('desc_en', 'like', "%{$search}%");
            });
        });

        $eventsQuery->when($status, function ($q) use ($status) {
            $q->where('status', $status);
        });

        $eventsQuery->when($category, function ($q) use ($category) {
            $q->where('category', $category);
        });

        $eventsQuery->when($level, function ($q) use ($level) {
            $q->where('level', $level);
        });

        $events = $eventsQuery->latest()->paginate(5)->withQueryString();

        return inertia('Admin/Events/Index', [
            'events' => $events,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'category', 'level'])
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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,avif|max:10240',
            'status' => 'required|in:upcoming,ongoing,completed',
        ]);
        if ($request->hasFile('image')) {

            $validated['image_path'] = ImageUploadService::upload(
                $request->file('image'),
                'events'
            );
        }

        $event = \App\Models\Event::create($validated);

        // Notify all users about the new event
        $users = \App\Models\User::all();
        \Illuminate\Support\Facades\Notification::send($users, new \App\Notifications\NewEventNotification($event));

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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,avif|max:10240',
            'status' => 'required|in:upcoming,ongoing,completed',
        ]);
        if ($request->hasFile('image')) {

            $validated['image_path'] = ImageUploadService::upload(
                $request->file('image'),
                'events',
                $event->image_path
            );
        }
        $event->update($validated);

        return back()->with('success', 'تم تحديث الفعالية بنجاح.');
    }
    public function destroy(string $id)
{
    try {

        $event = \App\Models\Event::with([
            'registrations.user.wallet'
        ])->findOrFail($id);

        \DB::transaction(function () use ($event) {

            /*
            |--------------------------------------------------------------------------
            | Refund Approved Registrations
            |--------------------------------------------------------------------------
            */

            foreach ($event->registrations as $registration) {

                // refund only approved players
                if ($registration->status !== 'approved') {
                    continue;
                }

                if (!$registration->user) {
                    continue;
                }

                $wallet = $registration->user->wallet;

                if (!$wallet) {
                    continue;
                }

                /*
                |--------------------------------------------------------------------------
                | Refund Wallet
                |--------------------------------------------------------------------------
                */

                app(\App\Services\WalletService::class)->deposit(
                    $wallet,
                    $event->fee,
                    "استرجاع رسوم فعالية #{$event->id}",
                    auth()->id(),
                    $event
                );

                /*
                |--------------------------------------------------------------------------
                | Cancel Registration
                |--------------------------------------------------------------------------
                */

                $registration->update([
                    'status' => 'cancelled'
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Delete Event Image
            |--------------------------------------------------------------------------
            */

            if ($event->image_path) {

                ImageUploadService::delete(
                    $event->image_path
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Delete Event
            |--------------------------------------------------------------------------
            */

            $event->delete();
        });

        return back()->with(
            'success',
            'تم حذف الفعالية واسترجاع الرسوم بنجاح.'
        );

    } catch (\Exception $e) {

        return back()->withErrors([
            'error' => $e->getMessage()
        ]);
    }
}



    public function registrations(string $id)
    {
        $event = \App\Models\Event::with(['registrations.user'])->findOrFail($id);
        return response()->json($event->registrations);
    }

    public function updateRegistrationStatus(
        \Illuminate\Http\Request $request,
        string $eventId,
        string $registrationId
    )
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $registration = \App\Models\EventRegistration::with([
            'user.wallet',
            'event'
        ])->where('event_id', $eventId)
        ->findOrFail($registrationId);

        $event = $registration->event;

        /*
        |--------------------------------------------------------------------------
        | APPROVE REGISTRATION
        |--------------------------------------------------------------------------
        */

        if ($request->status === 'approved') {

            /*
            |--------------------------------------------------------------------------
            | Paid Event
            |--------------------------------------------------------------------------
            */

            if ($event->fee > 0) {

                $wallet = $registration->user?->wallet;

                if (!$wallet) {

                    return back()->withErrors([
                        'error' => 'اللاعب لا يملك محفظة.'
                    ]);
                }

                try {

                    app(\App\Services\WalletService::class)
                        ->eventPayment(
                            $wallet,
                            $event,
                            $event->fee,
                            "رسوم التسجيل في فعالية #{$event->id}",
                            auth()->id()
                        );

                } catch (\Exception $e) {

                    return back()->withErrors([
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Update Registration Status
        |--------------------------------------------------------------------------
        */

        $registration->update([
            'status' => $request->status
        ]);
        
        if ($registration->user) {
            $registration->user->notify(
                new \App\Notifications\EventRegistrationNotification(
                    $registration->event,
                    $request->status   // 'approved' or 'rejected'
                )
            );
        }

        $message =
            $request->status === 'approved'
                ? 'تمت الموافقة على طلب التسجيل.'
                : 'تم رفض طلب التسجيل.';

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
