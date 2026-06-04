<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$triggers = DB::select("SHOW TRIGGERS");
echo "Triggers Count: " . count($triggers) . "\n";
print_r($triggers);
