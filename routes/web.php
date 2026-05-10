<?php

use App\Http\Controllers\AdminBookingController;
use App\Http\Controllers\AdminFinanceController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WalletController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

Route::get('/services', function () {
    return Inertia::render('Services');
})->name('services');

Route::get('/events', [EventController::class, 'index'])->name('events');
Route::get('/events/{event}', [EventController::class, 'show'])->name('events.show');

Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

Route::get('/book-court', [BookingController::class, 'guestBooking'])->name('booking.guest');

Route::post('/book-court', [BookingController::class, 'store'])->name('booking.guest.store');
Route::get('/api/courts/{court}/availability', [BookingController::class, 'getAvailability'])->name('api.courts.availability');
Route::get('/api/courts/{court}/available-coaches', [BookingController::class, 'getAvailableCoaches'])->name('api.courts.coaches');

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

Route::get('/dashboard',[DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | PROFILE
    |--------------------------------------------------------------------------
    */

    Route::get('/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');

    Route::patch('/profile', [ProfileController::class, 'update'])
        ->name('profile.update');

    Route::delete('/profile', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');


    /*
    |--------------------------------------------------------------------------
    | WALLET
    |--------------------------------------------------------------------------
    */

    Route::middleware('permission:wallet.view')->group(function () {

        Route::get('/wallet', [WalletController::class, 'index'])
            ->name('wallet.index');

        Route::post('/wallet/{wallet}/deposit', [WalletController::class, 'deposit'])
            ->middleware('permission:players.edit')
            ->name('wallet.deposit');

        Route::post('/wallet/{wallet}/deduct', [WalletController::class, 'deduct'])
            ->middleware('permission:players.edit')
            ->name('wallet.deduct');
    });


        Route::post(
            '/admin/bookings/{booking}/payment',
            [AdminBookingController::class, 'addPayment']
        )->middleware('permission:players.edit')
        ->name('admin.bookings.payment');


    /*
    |--------------------------------  ------------------------------------------
    | USER BOOKINGS
    |--------------------------------------------------------------------------
    */

    Route::middleware('permission:bookings.view')->group(function () {

        Route::get('/my-bookings', [BookingController::class, 'index'])
            ->name('booking.index');

        Route::post('/my-bookings', [BookingController::class, 'store'])
            ->middleware('permission:bookings.create')
            ->name('booking.store');

        Route::post('/my-bookings/{booking}/cancel', [BookingController::class, 'cancel'])
            ->middleware('permission:bookings.cancel')
            ->name('booking.cancel');
    });


    /*
    |--------------------------------------------------------------------------
    | ADMIN BOOKINGS
    |--------------------------------------------------------------------------
    */

    Route::middleware('permission:bookings.view')->group(function () {

        Route::get('/admin/bookings', [AdminBookingController::class, 'index'])
            ->name('admin.bookings');

        Route::post('/admin/bookings', [AdminBookingController::class, 'store'])
            ->middleware('permission:bookings.create')
            ->name('admin.bookings.store');

        Route::post('/admin/bookings/{booking}/approve', [AdminBookingController::class, 'approve'])
            ->middleware('permission:players.edit')
            ->name('admin.bookings.approve');

        Route::post('/admin/bookings/{booking}/reject', [AdminBookingController::class, 'reject'])
            ->middleware('permission:players.edit')
            ->name('admin.bookings.reject');

        Route::post('/admin/bookings/{booking}/complete', [AdminBookingController::class, 'complete'])
            ->middleware('permission:players.edit')
            ->name('admin.bookings.complete');
    });


    /*
    |--------------------------------------------------------------------------
    | FINANCE
    |--------------------------------------------------------------------------
    */

    Route::middleware('permission:finance.view')->group(function () {

        Route::get('/admin/finances', [AdminFinanceController::class, 'index'])
            ->name('admin.finances.index');


            /*
        |--------------------------------------------------------------------------
        | Expenses
        |--------------------------------------------------------------------------
        */

        Route::post(
            '/admin/expenses',
            [AdminFinanceController::class, 'storeExpense']
        )->name('admin.expenses.store');

        Route::post(
            '/admin/expenses/{expense}/end',
            [AdminFinanceController::class, 'endExpense']
        )->name('admin.expenses.end');

        Route::delete(
            '/admin/expenses/{expense}',
            [AdminFinanceController::class, 'deleteExpense']
        )->name('admin.expenses.delete');
    });


    /*
    |--------------------------------------------------------------------------
    | EVENTS PUBLIC REGISTRATION
    |--------------------------------------------------------------------------
    */

    Route::post('/events/{event}/register', [\App\Http\Controllers\EventController::class, 'register'])
        ->name('events.register');

    Route::post('/events/{event}/cancel-registration', [\App\Http\Controllers\EventController::class, 'cancelRegistration'])
        ->name('events.cancel_registration');


    /*
    |--------------------------------------------------------------------------
    | COURTS
    |--------------------------------------------------------------------------
    */

    Route::middleware('permission:courts.view')->group(function () {

        Route::get('/admin/courts', [\App\Http\Controllers\Admin\CourtController::class, 'index'])
            ->name('admin.courts.index');

        Route::get('/admin/courts/create', [\App\Http\Controllers\Admin\CourtController::class, 'create'])
            ->middleware('permission:courts.create')
            ->name('admin.courts.create');

        Route::post('/admin/courts', [\App\Http\Controllers\Admin\CourtController::class, 'store'])
            ->middleware('permission:courts.create')
            ->name('admin.courts.store');

        Route::get('/admin/courts/{court}', [\App\Http\Controllers\Admin\CourtController::class, 'show'])
            ->name('admin.courts.show');

        Route::get('/admin/courts/{court}/edit', [\App\Http\Controllers\Admin\CourtController::class, 'edit'])
            ->middleware('permission:courts.edit')
            ->name('admin.courts.edit');

        Route::put('/admin/courts/{court}', [\App\Http\Controllers\Admin\CourtController::class, 'update'])
            ->middleware('permission:courts.edit')
            ->name('admin.courts.update');

        Route::delete('/admin/courts/{court}', [\App\Http\Controllers\Admin\CourtController::class, 'destroy'])
            ->middleware('permission:courts.delete')
            ->name('admin.courts.destroy');
    });


    /*
    |--------------------------------------------------------------------------
    | EVENTS
    |--------------------------------------------------------------------------
    */

    Route::middleware('permission:events.view')->group(function () {

        Route::resource('/admin/events', \App\Http\Controllers\Admin\EventController::class)
            ->names('admin.events');

        Route::post('/admin/events/{event}/status', [\App\Http\Controllers\Admin\EventController::class, 'updateEventStatus'])
            ->middleware('permission:events.edit')
            ->name('admin.events.status');

        Route::post('/admin/events/{event}/registrations/{registration}/status', [\App\Http\Controllers\Admin\EventController::class, 'updateRegistrationStatus'])
            ->middleware('permission:events.edit')
            ->name('admin.events.registrations.status');

        Route::post('/admin/events/{event}/registrations/{registration}/placement', [\App\Http\Controllers\Admin\EventController::class, 'updatePlacement'])
            ->middleware('permission:events.edit')
            ->name('admin.events.registrations.placement');
    });


    /*
    |--------------------------------------------------------------------------
    | COACHES
    |--------------------------------------------------------------------------
    */

    Route::middleware('permission:coaches.view')->group(function () {

        Route::resource('/admin/coaches', \App\Http\Controllers\Admin\CoachController::class)
            ->names('admin.coaches')
            ->parameters(['coaches' => 'coach']);
    });


    /*
    |--------------------------------------------------------------------------
    | PLAYERS
    |--------------------------------------------------------------------------
    */

    Route::middleware('permission:players.view')->group(function () {

        Route::resource('/admin/players', \App\Http\Controllers\Admin\PlayerController::class)
            ->names('admin.players')
            ->parameters(['players' => 'player']);
    });


    /*
    |--------------------------------------------------------------------------
    | STAFF
    |--------------------------------------------------------------------------
    */

    Route::middleware('permission:staff.view')->group(function () {

        Route::resource('/admin/staff', \App\Http\Controllers\Admin\StaffController::class)
            ->names('admin.staff')
            ->parameters(['staff' => 'staff']);
    });

});

require __DIR__.'/auth.php';
