<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Laravel config timezone: " . config('app.timezone') . "\n";
echo "Carbon now: " . Carbon\Carbon::now()->toDateTimeString() . "\n";
echo "PHP date now: " . date('Y-m-d H:i:s T') . "\n";
