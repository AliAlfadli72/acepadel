<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

// Since we are running outside a web request, bootstrap the container
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "--- Users List ---\n";
$users = \App\Models\User::all();
foreach ($users as $user) {
    $roles = $user->roles->pluck('name')->join(', ');
    $packagesCount = $user->userPilatesPackages()->where('expires_at', '>', now())->sum('remaining_classes');
    echo "ID: {$user->id} | Name: {$user->name} | Email: {$user->email} | Roles: [{$roles}] | Wallet: {$user->wallet_balance} SYP | Active Pilates Classes: {$packagesCount}\n";
}
echo "------------------\n";
