<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

Route::get('/services', function () {
    return Inertia::render('Services');
})->name('services');

Route::get('/events', [\App\Http\Controllers\EventController::class, 'index'])->name('events');
Route::get('/events/{event}', [\App\Http\Controllers\EventController::class, 'show'])->name('events.show');

Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

Route::get('/book-court', function () {
    $courts = \App\Models\Court::where('is_active', true)->orderBy('id')->get();
    return Inertia::render('Booking', [
        'courts' => $courts,
    ]);
})->name('booking.guest');

Route::post('/book-court', [\App\Http\Controllers\BookingController::class, 'store'])->name('booking.guest.store');
Route::get('/api/courts/{court}/availability', [\App\Http\Controllers\BookingController::class, 'getAvailability'])->name('api.courts.availability');
Route::get('/api/courts/{court}/available-coaches', [\App\Http\Controllers\BookingController::class, 'getAvailableCoaches'])->name('api.courts.coaches');

Route::get('/contact', function () {
    return Inertia::render('Contact');
})->name('contact');

Route::get('/welcome', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    $user = Illuminate\Support\Facades\Auth::user();
    
    $stats = [
        'total_bookings' => 0,
        'wallet_balance' => 0,
        'upcoming_matches' => 0,
        'revenue_data' => [],
        'bookings_data' => [],
        'recent_activity' => []
    ];

    $now = \Carbon\Carbon::now();
    $last7Days = collect(range(6, 0))->map(fn($day) => $now->copy()->subDays($day)->format('Y-m-d'));

    if ($user && ($user->hasRole('Admin') || $user->hasRole('Receptionist'))) {
        $stats['total_bookings'] = \App\Models\Booking::count();
        $stats['upcoming_matches'] = \App\Models\Booking::whereIn('status', ['approved', 'pending'])->where('start_time', '>', now())->count();
        
        $stats['total_players'] = \App\Models\User::role('Player')->count();
        $stats['total_coaches'] = \App\Models\User::role('Coach')->count();
        $stats['active_courts'] = \App\Models\Court::where('is_active', true)->count();
        
        $revenueData = [];
        $bookingsData = [];
        foreach ($last7Days as $date) {
            $dailyBookingsCount = \App\Models\Booking::whereDate('created_at', $date)->count();
            $dailyRevenue = \App\Models\Booking::whereDate('created_at', $date)->where('status', 'approved')->sum('total_price');

            $dayName = \Carbon\Carbon::parse($date)->locale('ar')->translatedFormat('D');
            $revenueData[] = ['date' => $dayName, 'amount' => $dailyRevenue];
            $bookingsData[] = ['date' => $dayName, 'count' => $dailyBookingsCount];
        }

        $stats['revenue_data'] = $revenueData;
        $stats['bookings_data'] = $bookingsData;
        
        $stats['recent_activity'] = \App\Models\Booking::with('user')->orderBy('created_at', 'desc')->take(5)->get()->map(function($b) {
            return [
                'id' => $b->id,
                'title' => 'حجز جديد: ' . ($b->user ? $b->user->name : 'زائر'),
                'time' => $b->created_at->locale('ar')->diffForHumans(),
                'status' => $b->status,
            ];
        });

        // Top Coaches by Revenue (from CoachProfile total_revenue or bookings)
        $stats['top_coaches'] = \App\Models\User::role('Coach')->with('coachProfile')->get()->map(function($coach) {
            return [
                'id' => $coach->id,
                'name' => $coach->name,
                'revenue' => $coach->coachProfile ? $coach->coachProfile->total_revenue : 0,
                'sessions' => $coach->coachProfile ? $coach->coachProfile->total_sessions : 0,
            ];
        })->sortByDesc('revenue')->take(4)->values();

        // Top Players by Bookings
        $stats['top_players'] = \App\Models\User::role('Player')->withCount('bookings')->orderByDesc('bookings_count')->take(4)->get()->map(function($player) {
            return [
                'id' => $player->id,
                'name' => $player->name,
                'matches' => $player->bookings_count,
            ];
        });

    } else {
        $stats['total_bookings'] = $user ? $user->bookings()->count() : 0;
        $stats['wallet_balance'] = ($user && $user->wallet) ? $user->wallet->balance : 0;
        $stats['upcoming_matches'] = $user ? $user->bookings()->whereIn('status', ['approved', 'pending'])->where('start_time', '>', now())->count() : 0;
        
        $bookingsData = [];
        foreach ($last7Days as $date) {
            $dailyBookingsCount = $user ? $user->bookings()->whereDate('created_at', $date)->count() : 0;
            
            $dayName = \Carbon\Carbon::parse($date)->locale('ar')->translatedFormat('D');
            $bookingsData[] = ['date' => $dayName, 'count' => $dailyBookingsCount];
        }
        $stats['bookings_data'] = $bookingsData;

        $stats['recent_activity'] = clone collect(
            $user ? $user->bookings()->orderBy('created_at', 'desc')->take(5)->get()->map(function($b) {
                return [
                    'id' => $b->id,
                    'title' => 'حجز ملعب ' . $b->court_id,
                    'time' => $b->created_at->locale('ar')->diffForHumans(),
                    'status' => $b->status,
                ];
            }) : []
        );
    }

    return Inertia::render('Dashboard', [
        'stats' => $stats
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Wallet Routes
    Route::get('/wallet', [\App\Http\Controllers\WalletController::class, 'index'])->name('wallet.index');
    Route::post('/wallet/{wallet}/deposit', [\App\Http\Controllers\WalletController::class, 'deposit'])->name('wallet.deposit');
    Route::post('/wallet/{wallet}/deduct', [\App\Http\Controllers\WalletController::class, 'deduct'])->name('wallet.deduct');

    // Customer Booking Routes (Dashboard)
    Route::get('/my-bookings', [\App\Http\Controllers\BookingController::class, 'index'])->name('booking.index');
    Route::post('/my-bookings', [\App\Http\Controllers\BookingController::class, 'store'])->name('booking.store');
    Route::post('/my-bookings/{booking}/cancel', [\App\Http\Controllers\BookingController::class, 'cancel'])->name('booking.cancel');

    // Admin & Receptionist Booking Routes
    Route::get('/admin/bookings', [\App\Http\Controllers\AdminBookingController::class, 'index'])->name('admin.bookings');
    Route::post('/admin/bookings', [\App\Http\Controllers\AdminBookingController::class, 'store'])->name('admin.bookings.store');
    Route::post('/admin/bookings/{booking}/approve', [\App\Http\Controllers\AdminBookingController::class, 'approve'])->name('admin.bookings.approve');
    Route::post('/admin/bookings/{booking}/reject', [\App\Http\Controllers\AdminBookingController::class, 'reject'])->name('admin.bookings.reject');
    Route::post('/admin/bookings/{booking}/complete', [\App\Http\Controllers\AdminBookingController::class, 'complete'])->name('admin.bookings.complete');

    // Admin Finances Route
    Route::get('/admin/finances', [\App\Http\Controllers\AdminFinanceController::class, 'index'])->name('admin.finances.index');

    // Public Events Registration
    Route::post('/events/{event}/register', [\App\Http\Controllers\EventController::class, 'register'])->name('events.register');
    Route::post('/events/{event}/cancel-registration', [\App\Http\Controllers\EventController::class, 'cancelRegistration'])->name('events.cancel_registration');

    // Admin Courts Routes
    Route::resource('/admin/courts', \App\Http\Controllers\Admin\CourtController::class)->names('admin.courts');

    // Admin Events Routes
    Route::resource('/admin/events', \App\Http\Controllers\Admin\EventController::class)->names('admin.events');
    Route::post('/admin/events/{event}/status', [\App\Http\Controllers\Admin\EventController::class, 'updateEventStatus'])->name('admin.events.status');
    Route::post('/admin/events/{event}/registrations/{registration}/status', [\App\Http\Controllers\Admin\EventController::class, 'updateRegistrationStatus'])->name('admin.events.registrations.status');
    Route::post('/admin/events/{event}/registrations/{registration}/placement', [\App\Http\Controllers\Admin\EventController::class, 'updatePlacement'])->name('admin.events.registrations.placement');

    // Admin Coaches Routes
    Route::resource('/admin/coaches', \App\Http\Controllers\Admin\CoachController::class)
        ->names('admin.coaches')
        ->parameters(['coaches' => 'coach']);

    // Admin Players Routes
    Route::resource('/admin/players', \App\Http\Controllers\Admin\PlayerController::class)
        ->names('admin.players')
        ->parameters(['players' => 'player']);

    // Admin Staff Routes
    Route::middleware(['role:Admin'])->group(function () {
        Route::resource('/admin/staff', \App\Http\Controllers\Admin\StaffController::class)
            ->names('admin.staff')
            ->parameters(['staff' => 'staff']);
    });
});

require __DIR__.'/auth.php';
