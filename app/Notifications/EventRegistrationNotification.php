<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Channels\FcmChannel;
use App\Models\Event;

class EventRegistrationNotification extends Notification
{
    use Queueable;

    protected Event $event;

    public function __construct(Event $event)
    {
        $this->event = $event;
    }

    public function via($notifiable)
    {
        return ['database', FcmChannel::class];
    }

    public function toDatabase($notifiable)
    {
        return [
            'title' => 'تم التسجيل في الفعالية 🏆',
            'message' => 'تم تسجيلك بنجاح في الفعالية: ' . $this->event->title_ar . '. نتمنى لك التوفيق!',
            'type' => 'event_registration',
            'event_id' => $this->event->id,
        ];
    }

    public function toFcm($notifiable)
    {
        return [
            'title' => 'تم التسجيل في الفعالية 🏆',
            'body' => 'تم تسجيلك بنجاح في الفعالية: ' . $this->event->title_ar . '. نتمنى لك التوفيق!',
            'data' => [
                'type' => 'event_registration',
                'event_id' => (string) $this->event->id,
            ]
        ];
    }
}
