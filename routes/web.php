<?php

use App\Http\Controllers\AdminBookingController;
use App\Http\Controllers\AdminFinanceController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\PlayerController;
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

Route::get('/book-pilates', [\App\Http\Controllers\PilatesController::class, 'index'])->name('pilates.booking.page');

Route::get('/players', [PlayerController::class, 'index'])
    ->name('players.index');

Route::get('/contact', function () {
    return Inertia::render('Contact');
})->name('contact');

Route::get('/terms', function () {
    return Inertia::render('Terms');
})->name('terms');

Route::get('/privacy', function () {
    return Inertia::render('Privacy');
})->name('privacy');

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
     Route::get('/wallet', [WalletController::class, 'index'])->name('wallet.index');

    Route::middleware('permission:wallet.view')->group(function () {



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


    /*
    |--------------------------------------------------------------------------
    | NOTIFICATIONS
    |--------------------------------------------------------------------------
    |
    */
    Route::middleware('role:Admin|Manager|Receptionist|Pilates Admin')->group(function () {
        Route::get('/admin/notifications', [\App\Http\Controllers\Admin\NotificationController::class, 'index'])->name('admin.notifications.index');
        Route::delete('/admin/notifications/{id}', [\App\Http\Controllers\Admin\NotificationController::class, 'destroy'])->name('admin.notifications.destroy');
        Route::post('/admin/notifications/clear-all', [\App\Http\Controllers\Admin\NotificationController::class, 'clearAll'])->name('admin.notifications.clear-all');
    });

    /*
    |--------------------------------------------------------------------------
    | PILATES STUDIO (ADMIN)
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin/pilates')->name('admin.pilates.')->group(function () {
        Route::get('/', [\App\Http\Controllers\PilatesAdminController::class, 'index'])->middleware('permission:pilates.view')->name('index');
        Route::post('/', [\App\Http\Controllers\PilatesAdminController::class, 'store'])->middleware('permission:pilates.create')->name('store');
        Route::put('/{session}', [\App\Http\Controllers\PilatesAdminController::class, 'update'])->middleware('permission:pilates.edit')->name('update');
        Route::delete('/{session}', [\App\Http\Controllers\PilatesAdminController::class, 'destroy'])->middleware('permission:pilates.delete')->name('destroy');
        Route::get('/bookings', [\App\Http\Controllers\PilatesAdminController::class, 'manageBookings'])->middleware('permission:pilates.bookings.view')->name('bookings.index');
        Route::post('/bookings/{booking}/confirm', [\App\Http\Controllers\PilatesAdminController::class, 'confirmBooking'])->middleware('permission:pilates.bookings.approve')->name('bookings.confirm');
        Route::post('/bookings/{booking}/cancel', [\App\Http\Controllers\PilatesAdminController::class, 'cancelBooking'])->middleware('permission:pilates.bookings.approve')->name('bookings.cancel');

        // Packages CRUD
        Route::get('/packages', [\App\Http\Controllers\PilatesPackageAdminController::class, 'index'])->middleware('permission:pilates.view')->name('packages.index');
        Route::post('/packages', [\App\Http\Controllers\PilatesPackageAdminController::class, 'store'])->middleware('permission:pilates.create')->name('packages.store');
        Route::put('/packages/{package}', [\App\Http\Controllers\PilatesPackageAdminController::class, 'update'])->middleware('permission:pilates.edit')->name('packages.update');
        Route::delete('/packages/{package}', [\App\Http\Controllers\PilatesPackageAdminController::class, 'destroy'])->middleware('permission:pilates.delete')->name('packages.destroy');
    });

    Route::post('/book-pilates', [\App\Http\Controllers\PilatesController::class, 'book'])->name('pilates.book');
    Route::post('/pilates/packages/buy', [\App\Http\Controllers\PilatesController::class, 'buyPackage'])->name('pilates.packages.buy');
    
    // Dev route to assign Pilates package for testing
    Route::get('/dev/assign-package', function (\Illuminate\Http\Request $request) {
        $package = \App\Models\PilatesPackage::firstOrCreate(
            ['name' => '6-Class Monthly Pack'],
            [
                'total_classes' => 6,
                'price' => 120000.00,
                'valid_days' => 30
            ]
        );

        $targetUserId = $request->query('user_id');
        $targetEmail = $request->query('email');
        $selectedUser = null;

        if ($targetUserId) {
            $selectedUser = \App\Models\User::find($targetUserId);
        } elseif ($targetEmail) {
            $selectedUser = \App\Models\User::where('email', $targetEmail)->first();
        }

        if ($selectedUser) {
            \App\Models\UserPilatesPackage::create([
                'user_id' => $selectedUser->id,
                'pilates_package_id' => $package->id,
                'remaining_classes' => 6,
                'expires_at' => now()->addDays(30)
            ]);

            return redirect()->route('dev.assign-package')->with('success_message', "Successfully assigned '6-Class Monthly Pack' to user: {$selectedUser->name} ({$selectedUser->email})!");
        }

        // Otherwise, show list of users to assign packages
        $users = \App\Models\User::all();
        $success = session('success_message');

        $html = "<!DOCTYPE html>
<html>
<head>
    <title>Dev: Assign Pilates Packages</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f3f4f6; color: #1f2937; padding: 40px; margin: 0; }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-top: 5px solid #1d3922; }
        h1 { color: #1d3922; margin-top: 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; font-size: 24px; }
        .alert { background-color: #d1fae5; color: #065f46; padding: 15px; border-radius: 6px; margin-bottom: 20px; font-weight: 500; border: 1px solid #a7f3d0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background-color: #f9fafb; color: #4b5563; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
        tr:hover { background-color: #f9fafb; }
        .btn { display: inline-block; padding: 6px 12px; background-color: #1d3922; color: white; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 500; transition: background-color 0.2s; border: none; cursor: pointer; }
        .btn:hover { background-color: #112214; }
        .role-badge { display: inline-block; padding: 2px 8px; font-size: 11px; font-weight: 600; border-radius: 9999px; background-color: #e5e7eb; color: #4b5563; }
        .active-count { font-weight: bold; color: #059669; }
        .no-classes { color: #9ca3af; }
    </style>
</head>
<body>
    <div class='container'>";
        if ($success) {
            $html .= "<div class='alert'>✓ {$success}</div>";
        }
        $html .= "
        <h1>Assign Pilates Package to User</h1>
        <p style='color: #6b7280; font-size: 14px;'>Click 'Assign Package' to allocate a free 6-Class Monthly Pack to any user so they can book Pilates sessions.</p>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Roles</th>
                    <th>Current Active Classes</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>";
        foreach ($users as $u) {
            $roles = $u->roles->pluck('name')->join(', ');
            $classesCount = $u->userPilatesPackages()->where('expires_at', '>', now())->sum('remaining_classes');
            $classesDisplay = $classesCount > 0 ? "<span class='active-count'>{$classesCount} classes</span>" : "<span class='no-classes'>0 classes</span>";
            $assignUrl = route('dev.assign-package') . "?user_id=" . $u->id;
            $html .= "
                <tr>
                    <td>{$u->id}</td>
                    <td><strong>{$u->name}</strong></td>
                    <td>{$u->email}</td>
                    <td><span class='role-badge'>{$roles}</span></td>
                    <td>{$classesDisplay}</td>
                    <td><a href='{$assignUrl}' class='btn'>Assign Package</a></td>
                </tr>";
        }
        $html .= "
            </tbody>
        </table>
    </div>
</body>
</html>";
        return response($html);
    })->name('dev.assign-package');

});

require __DIR__.'/auth.php';
