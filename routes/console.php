<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('notify:test {token}', function ($token) {
    $service = app(\App\Services\PushNotificationService::class);
    
    $user = new \stdClass();
    $user->fcm_token = $token;
    
    $this->info("Sending test notification to FCM Token: $token");
    
    try {
        $success = $service->sendToUser(
            $user,
            'Ace Padel Test',
            'Hello from Antigravity!',
            ['type' => 'test_notification']
        );
        
        if ($success) {
            $this->info("Notification sent successfully!");
        } else {
            $this->error("Failed to send notification. Check storage/logs/laravel.log for details.");
        }
    } catch (\Exception $e) {
        $this->error("Exception: " . $e->getMessage());
    }
})->purpose('Test Firebase push notifications');
