<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use App\Services\PushNotificationService;

class FcmChannel
{
    protected PushNotificationService $pushService;

    public function __construct(PushNotificationService $pushService)
    {
        $this->pushService = $pushService;
    }

    /**
     * Send the given notification.
     *
     * @param  mixed  $notifiable
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return void
     */
    public function send($notifiable, Notification $notification)
    {
        if (!method_exists($notification, 'toFcm')) {
            return;
        }

        $message = $notification->toFcm($notifiable);
        
        if (empty($message)) {
            return;
        }

        $title = $message['title'] ?? 'Ace Padel';
        $body = $message['body'] ?? '';
        $data = $message['data'] ?? [];

        $this->pushService->sendToUser($notifiable, $title, $body, $data);
    }
}
