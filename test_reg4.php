<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $user = App\Models\User::first();
    $event = App\Models\Event::find(4);
    if (!$event) {
        echo "Event 4 not found!\n";
        exit;
    }
    
    echo "Event 4 title: " . $event->title . "\n";
    echo "Event 4 price: " . $event->price . "\n";
    echo "Event 4 max_participants: " . $event->max_participants . "\n";
    
    // Delete existing registration for test
    App\Models\EventRegistration::where('event_id', $event->id)->where('user_id', $user->id)->delete();
    
    $reg = App\Models\EventRegistration::create([
        'event_id' => $event->id,
        'user_id' => $user->id,
        'status' => 'pending',
    ]);
    
    echo "SUCCESS: Created registration ID: " . $reg->id . "\n";
} catch (\Throwable $e) {
    echo "EXCEPT: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
}
