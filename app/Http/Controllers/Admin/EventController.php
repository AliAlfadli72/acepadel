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
            'category' => 'required|string|max:255',
            'level' => 'required|string|max:255',
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
            'category' => 'required|string|max:255',
            'level' => 'required|string|max:255',
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
                | Refund Wallet (Only if fee > 0)
                |--------------------------------------------------------------------------
                */

                $fee = (float) ($event->fee ?? 0);
                if ($fee > 0) {
                    app(\App\Services\WalletService::class)->deposit(
                        $wallet,
                        $fee,
                        "استرجاع رسوم فعالية #{$event->id}",
                        'padel',
                        auth()->id(),
                        $event
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Cancel Registration
                |--------------------------------------------------------------------------
                */

                $registration->update([
                    'status' => 'rejected'
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

    protected function getOrCreateTournamentForEvent(\App\Models\Event $event)
    {
        $tournament = \App\Models\Tournament::with([
            'categories.teams.player1',
            'categories.teams.player2',
            'categories.matches.team1',
            'categories.matches.team2',
            'categories.matches.winner',
        ])->where('title_ar', $event->title_ar)->first();

        if (!$tournament) {
            $tournament = \App\Models\Tournament::create([
                'title_ar' => $event->title_ar,
                'title_en' => $event->title_en ?: $event->title_ar,
                'desc_ar' => $event->desc_ar,
                'desc_en' => $event->desc_en ?: $event->desc_ar,
                'location_ar' => 'نادي آيس بادل',
                'location_en' => 'Ace Padel Club',
                'prize_pool' => $event->prize_ar ?? '40 Million SYP',
                'start_date' => $event->date ?: now(),
                'end_date' => $event->date ?: now(),
                'status' => 'ongoing',
            ]);
        }

        $targetCategoryName = ($event->level && str_contains($event->level, 'Category'))
            ? $event->level
            : ($event->level ?: 'Category A');

        if ($tournament->categories->isEmpty()) {
            \App\Models\TournamentCategory::create([
                'tournament_id' => $tournament->id,
                'name' => $targetCategoryName,
                'max_teams' => 16,
                'fee' => $event->fee ?? 0,
                'format' => 'knockout',
            ]);

            $tournament->load([
                'categories.teams.player1',
                'categories.teams.player2',
                'categories.matches.team1',
                'categories.matches.team2',
                'categories.matches.winner',
            ]);
        }

        return $tournament;
    }

    public function show(string $id)
    {
        $event = \App\Models\Event::with(['registrations.user'])->findOrFail($id);
        $tournament = $this->getOrCreateTournamentForEvent($event);

        return inertia('Admin/Events/Show', [
            'event' => $event,
            'tournament' => $tournament,
        ]);
    }

    public function storeTeam(Request $request, string $eventId)
    {
        $event = \App\Models\Event::findOrFail($eventId);
        $tournament = $this->getOrCreateTournamentForEvent($event);

        $request->validate([
            'category_id' => 'nullable',
            'player1_id' => 'required|exists:users,id',
            'player2_id' => 'required|exists:users,id|different:player1_id',
            'team_name' => 'nullable|string|max:100',
        ]);

        $category = ($request->category_id && $request->category_id !== 'null')
            ? \App\Models\TournamentCategory::find($request->category_id)
            : $tournament->categories->first();

        if (!$category) {
            $category = $tournament->categories->first();
        }

        $p1 = \App\Models\User::find($request->player1_id);
        $p2 = \App\Models\User::find($request->player2_id);

        $existingTeamPlayer = \App\Models\TournamentTeam::where('tournament_category_id', $category->id)
            ->where(function($q) use ($p1, $p2) {
                $q->whereIn('player1_id', [$p1->id, $p2->id])
                  ->orWhereIn('player2_id', [$p1->id, $p2->id]);
            })->first();

        if ($existingTeamPlayer) {
            return back()->withErrors(['error' => 'أحد اللاعبين المحددِين مضاف بالفعل في فريق آخر ضمن هذه الفئة!']);
        }

        $teamName = $request->team_name ?: ($p1->name . ' + ' . $p2->name);

        \App\Models\TournamentTeam::create([
            'tournament_category_id' => $category->id,
            'team_name' => $teamName,
            'player1_id' => $p1->id,
            'player2_id' => $p2->id,
            'player2_name' => $p2->name,
            'status' => 'confirmed',
        ]);

        return redirect()->route('admin.events.show', $event->id)->with('success', 'تم تشكيل الفريق وتعيين اللاعبين بنجاح!');
    }

    public function destroyTeam(string $eventId, string $teamId)
    {
        $event = \App\Models\Event::findOrFail($eventId);
        $team = \App\Models\TournamentTeam::findOrFail($teamId);
        $team->delete();
        return redirect()->route('admin.events.show', $event->id)->with('success', 'تم حذف الفريق بنجاح.');
    }

    public function generateBracket(Request $request, string $eventId)
    {
        $event = \App\Models\Event::findOrFail($eventId);
        $tournament = $this->getOrCreateTournamentForEvent($event);

        $category = ($request->category_id && $request->category_id !== 'null')
            ? \App\Models\TournamentCategory::find($request->category_id)
            : $tournament->categories->first();

        if (!$category) {
            return back()->withErrors(['error' => 'لا توجد فئة متاحة لهذه البطولة.']);
        }
        
        try {
            app(\App\Services\TournamentBracketService::class)->generateBracket($category);
            return redirect()->route('admin.events.show', $event->id)->with('success', 'تم توليد شجرة التصفيات تلقائياً للبطولة بنجاح! 🏆');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function updateMatchResult(Request $request, string $eventId, string $matchId)
    {
        $event = \App\Models\Event::findOrFail($eventId);

        $request->validate([
            'winner_id' => 'required|exists:tournament_teams,id',
            'score_team1' => 'nullable|string',
            'score_team2' => 'nullable|string',
        ]);

        $match = \App\Models\TournamentMatch::findOrFail($matchId);
        
        try {
            app(\App\Services\TournamentBracketService::class)->recordMatchResult(
                $match,
                $request->winner_id,
                $request->score_team1,
                $request->score_team2
            );
            return redirect()->route('admin.events.show', $event->id)->with('success', 'تم تسجيل النتيجة وتأهيل الفائز للدور التالي! 🏆');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function updatePlacement(\Illuminate\Http\Request $request, string $eventId, string $registrationId)
    {
        $request->validate([
            'placement' => 'nullable|integer|min:1|max:10',
        ]);

        $registration = \App\Models\EventRegistration::where('event_id', $eventId)
            ->where('status', 'approved')
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
