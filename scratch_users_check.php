<?php

use App\Models\User;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

echo "--- DB Users & Profiles Diagnostics ---\n\n";

$users = User::all();
echo "Total Users in DB: " . $users->count() . "\n\n";

foreach ($users as $user) {
    $roles = $user->getRoleNames()->join(', ');
    $profilesCount = \App\Models\PlayerProfile::where('user_id', $user->id)->count();
    $walletsCount = \App\Models\Wallet::where('user_id', $user->id)->count();
    echo "ID: {$user->id} | Name: {$user->name} | Phone: {$user->phone} | Email: {$user->email}\n";
    echo " - Roles: [{$roles}]\n";
    echo " - Player Profiles: {$profilesCount}\n";
    echo " - Wallets: {$walletsCount}\n";
    echo "--------------------------------------------------\n";
}
