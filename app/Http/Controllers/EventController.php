<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use App\Services\WalletService;
class EventController extends Controller
{
    protected WalletService $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }
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

        return back()->with(
            'error',
            'يجب تسجيل الدخول للتسجيل في الفعالية.'
        );
    }

    $user = auth()->user();

    /*
    |--------------------------------------------------------------------------
    | Already Registered
    |--------------------------------------------------------------------------
    */

    $existingRegistration = \App\Models\EventRegistration::where(
            'event_id',
            $event->id
        )
        ->where('user_id', $user->id)
        ->first();

    if ($existingRegistration) {

        return back()->with(
            'error',
            'أنت مسجل بالفعل في هذه الفعالية.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Max Participants Check
    |--------------------------------------------------------------------------
    */

    if (
        $event->max_participants > 0 &&
        $event->registrations()
            ->where('status', 'approved')
            ->count() >= $event->max_participants
    ) {

        return back()->with(
            'error',
            'تم اكتمال عدد المشاركين في هذه الفعالية.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Create Pending Registration ONLY
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | No payment here.
    | Payment happens ONLY after admin approval.
    |
    */

    \App\Models\EventRegistration::create([

        'event_id' => $event->id,

        'user_id' => $user->id,

        'status' => 'pending',
    ]);

    return back()->with(
        'success',
        'تم إرسال طلب التسجيل بنجاح وبانتظار موافقة الإدارة.'
    );
}
public function cancelRegistration(Request $request, Event $event)
{
    if (!auth()->check()) {

        return back()->with(
            'error',
            'يجب تسجيل الدخول لإلغاء التسجيل.'
        );
    }

    $user = auth()->user();

    $registration = \App\Models\EventRegistration::where(
            'event_id',
            $event->id
        )
        ->where('user_id', $user->id)
        ->first();

    if (!$registration) {

        return back()->with(
            'error',
            'لم يتم العثور على تسجيل لهذه الفعالية.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Refund ONLY if already approved
    |--------------------------------------------------------------------------
    |
    | Because payment is taken only after admin approval.
    |
    */

    if (
        $registration->status === 'approved' &&
        $event->fee > 0
    ) {

        $wallet = $user->wallet;

        if ($wallet) {

            $this->walletService->deposit(
                $wallet,
                $event->fee,
                "استرجاع رسوم فعالية #{$event->id}",
                auth()->id(),
                $event
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Registration
    |--------------------------------------------------------------------------
    */

    $registration->delete();

    return back()->with(
        'success',
        'تم إلغاء التسجيل بنجاح.'
    );
}





}
