<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = App\Models\User::with('playerProfile')->get()->map(function($u) {
    return [
        'id' => $u->id,
        'name' => $u->name,
        'phone' => $u->phone,
        'points' => $u->playerProfile?->points,
        'rank_level' => $u->playerProfile?->rank_level,
    ];
})->toArray();

print_r($users);
