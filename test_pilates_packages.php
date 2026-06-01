<?php

use App\Models\User;
use App\Models\PilatesPackage;
use App\Models\UserPilatesPackage;
use App\Models\PilatesSession;
use App\Models\PilatesBooking;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\Pilates\BookSessionRequest;

// Bootstrap Laravel
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

echo "--- Starting Pilates Package Booking Verification ---\n\n";

DB::beginTransaction();

try {
    // 1. Get or create a player
    $player = User::firstOrCreate(
        ['email' => 'test_player@example.com'],
        [
            'name' => 'Test Player',
            'phone' => '0933112233',
            'password' => bcrypt('password')
        ]
    );
    // Assign Player role
    $player->assignRole('Player');
    echo "Player: {$player->name} (ID: {$player->id})\n";

    // 2. Get or create a coach
    $coach = User::firstOrCreate(
        ['email' => 'test_coach@example.com'],
        [
            'name' => 'Test Coach',
            'phone' => '0944112233',
            'password' => bcrypt('password')
        ]
    );
    // Assign Pilates Coach role
    $coach->assignRole('Pilates Coach');
    echo "Coach: {$coach->name} (ID: {$coach->id})\n";

    // 3. Create a Pilates Package
    $package = PilatesPackage::firstOrCreate(
        ['name' => '6-Class Monthly Pack'],
        [
            'total_classes' => 6,
            'price' => 120000.00,
            'valid_days' => 30
        ]
    );
    echo "Package Created: {$package->name} (Total Classes: {$package->total_classes})\n";

    // 4. Assign Package to Player
    $userPackage = UserPilatesPackage::create([
        'user_id' => $player->id,
        'pilates_package_id' => $package->id,
        'remaining_classes' => 5, // let's set 5 classes
        'expires_at' => now()->addDays($package->valid_days)
    ]);
    echo "Assigned Package to Player. Remaining Classes: {$userPackage->remaining_classes}\n";

    // 5. Create a Pilates Session
    $session = PilatesSession::create([
        'title' => 'Outdoor Pilates alignment session',
        'description' => 'A wonderful outdoor alignment pilates session.',
        'coach_id' => $coach->id,
        'session_type' => 'outdoor',
        'capacity' => 10,
        'price_per_session' => 20000.00,
        'session_date' => now()->addDays(2)->toDateString(),
        'start_time' => '10:00:00',
        'end_time' => '11:00:00',
        'status' => 'active'
    ]);
    echo "Session Created: '{$session->title}' | Type: {$session->session_type} | Coach ID: {$session->coach_id}\n";

    // 6. Perform a mock booking request
    echo "\nSimulating booking using package payment method...\n";
    
    // Bind mock request instance so Auth session guard does not throw under CLI
    $requestInstance = \Illuminate\Http\Request::create('/book-pilates', 'POST');
    app()->instance('request', $requestInstance);
    
    // Log player in
    auth()->login($player);

    $request = new BookSessionRequest();
    $request->merge([
        'pilates_session_id' => $session->id,
        'payment_method' => 'package'
    ]);

    // Instantiate PilatesController and trigger book method
    $controller = app(\App\Http\Controllers\PilatesController::class);
    $response = $controller->book($request);

    // Refresh user package balance
    $userPackage->refresh();
    echo "Booking complete.\n";
    echo "Updated remaining classes count: {$userPackage->remaining_classes} (Expected: 4)\n";

    // Retrieve the booking
    $booking = PilatesBooking::where('user_id', $player->id)
        ->where('pilates_session_id', $session->id)
        ->first();

    if ($booking) {
        echo "Booking ID: {$booking->id}\n";
        echo "Booking Payment Method: {$booking->payment_method} (Expected: package)\n";
        echo "Booking Status: {$booking->status} (Expected: confirmed)\n";
        echo "Booking User Package ID Linked: {$booking->user_pilates_package_id} (Expected: {$userPackage->id})\n";
        
        if ($userPackage->remaining_classes === 4 && $booking->payment_method === 'package' && $booking->status === 'confirmed') {
            echo "\n✅ VERIFICATION SUCCESSFUL: Pilates Package Book Flow Works!\n";
        } else {
            echo "\n❌ VERIFICATION FAILED: Mismatch in values.\n";
        }
    } else {
        echo "\n❌ VERIFICATION FAILED: Booking was not created.\n";
    }

} catch (\Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
} finally {
    // Rollback so we don't pollute the dev database with dummy test records
    DB::rollBack();
    echo "\nDatabase transaction rolled back successfully.\n";
}
