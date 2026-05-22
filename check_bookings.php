<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$bookings = App\Models\Booking::with(['user', 'court', 'coachProfile.user'])->get()->map(function($b) {
    return [
        'id' => $b->id,
        'player_name' => $b->user?->name ?? $b->guest_name,
        'court_name' => $b->court?->name,
        'coach_name' => $b->coachProfile?->user?->name,
        'coach_id' => $b->coach_profile_id,
        'start_time' => $b->start_time->toDateTimeString(),
        'end_time' => $b->end_time->toDateTimeString(),
        'status' => $b->status,
        'total_price' => $b->total_price,
    ];
})->toArray();

echo json_encode($bookings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
