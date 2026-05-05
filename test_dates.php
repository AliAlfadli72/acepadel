<?php
require 'vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$b = \App\Models\Booking::find(3);
echo json_encode(['start' => $b->start_time->toDateTimeString(), 'end' => $b->end_time->toDateTimeString()]);
