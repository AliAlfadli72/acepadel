<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\PilatesPackage;

echo "--- Pilates Packages with valid_days ---\n";
$pkgs = PilatesPackage::all();
foreach ($pkgs as $pkg) {
    echo "ID: {$pkg->id} | Name: {$pkg->name} | Total Classes: {$pkg->total_classes} | Price: {$pkg->price} | Valid Days: {$pkg->valid_days}\n";
}
echo "----------------------------------------\n";
