<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$coaches = App\Models\User::role('Coach')->with('coachProfile')->get()->map(function($u) {
    return [
        'user_id' => $u->id,
        'name' => $u->name,
        'coach_profile_id' => $u->coachProfile?->id,
    ];
})->toArray();

echo "Coaches:\n";
print_r($coaches);

$coach_bookings = App\Models\Booking::whereNotNull('coach_profile_id')->get()->toArray();
echo "\nBookings with coach:\n";
print_r($coach_bookings);
