<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\UserPilatesPackage;
use App\Models\PilatesPackage;

echo "--- Pilates Packages available in DB ---\n";
$pkgs = PilatesPackage::all();
foreach ($pkgs as $pkg) {
    echo "ID: {$pkg->id} | Name: {$pkg->name} | Total Classes: {$pkg->total_classes} | Price: {$pkg->price}\n";
}

echo "\n--- User Pilates Packages ---\n";
$userPkgs = UserPilatesPackage::with(['user', 'pilatesPackage'])->get();
foreach ($userPkgs as $up) {
    echo "User: {$up->user?->name} (ID: {$up->user_id}) | Package: {$up->pilatesPackage?->name} (ID: {$up->pilates_package_id}) | Remaining Classes: {$up->remaining_classes} | Expires At: {$up->expires_at}\n";
}
echo "-----------------------------\n";
