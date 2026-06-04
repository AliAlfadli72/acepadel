<?php
use App\Models\PlayerProfile;
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

echo "--- Player Profiles Tiers and Levels ---\n";
$profiles = PlayerProfile::with('user')->get();
foreach ($profiles as $profile) {
    echo "User: " . ($profile->user ? $profile->user->name : 'N/A') . " | Points: " . $profile->points . " | Rank Level (DB value): " . $profile->rank_level . "\n";
}
