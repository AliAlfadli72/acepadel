<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = \App\Models\User::find(1);
$userActivePackages = $user->userPilatesPackages()
    ->active()
    ->with('pilatesPackage')
    ->get();

echo json_encode($userActivePackages, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
