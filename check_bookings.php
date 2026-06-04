<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\PilatesBooking;

echo "--- Pilates Bookings Details ---\n";
$bookings = PilatesBooking::all();
foreach ($bookings as $b) {
    echo "Booking ID: {$b->id} | User ID: {$b->user_id} | Session ID: {$b->pilates_session_id} | User Package ID: {$b->user_pilates_package_id} | Status: {$b->status} | Method: {$b->payment_method} | Created At: {$b->created_at}\n";
}
echo "---------------------------------\n";
