<?php
require 'vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$date = '2026-05-05';
$startOfDay = \Carbon\Carbon::parse($date)->startOfDay();
$endOfDay = \Carbon\Carbon::parse($date)->addDay()->addHours(6);

$bookings = \App\Models\Booking::where('court_id', 4)
    ->whereIn('status', ['pending', 'approved', 'completed'])
    ->where(function($query) use ($startOfDay, $endOfDay) {
        $query->whereBetween('start_time', [$startOfDay, $endOfDay])
              ->orWhereBetween('end_time', [$startOfDay, $endOfDay]);
    })
    ->get();

$bookedSlots = [];

foreach ($bookings as $booking) {
    echo "Processing booking ID: {$booking->id}\n";
    echo "Start: {$booking->start_time}\n";
    echo "End: {$booking->end_time}\n";
    $currentSlot = $booking->start_time->copy();
    
    // Collect all hour slots that fall within this booking's duration
    while ($currentSlot->lt($booking->end_time)) {
        echo "Current slot inside loop: {$currentSlot->format('H:i')}\n";
        $bookedSlots[] = $currentSlot->format('H:i');
        // Also add half-hour slots if duration is 1.5, to be safe, but our grid is 1 hour increments
        $currentSlot->addHour(); 
    }
}
echo json_encode($bookedSlots);
