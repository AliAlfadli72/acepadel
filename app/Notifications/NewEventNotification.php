<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Channels\FcmChannel;
use App\Models\Event;

class NewEventNotification extends Notification
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
            'title' => 'فعالية جديدة متاحة 🌟',
            'message' => 'تم إضافة فعالية جديدة: ' . $this->event->title_ar . '. سجل الآن قبل اكتمال العدد!',
            'type' => 'new_event',
            'event_id' => $this->event->id,
        ];
    }

    public function toFcm($notifiable)
    {
        return [
            'title' => 'فعالية جديدة متاحة 🌟',
            'body' => 'تم إضافة فعالية جديدة: ' . $this->event->title_ar . '. سجل الآن قبل اكتمال العدد!',
            'data' => [
                'type' => 'new_event',
                'event_id' => (string) $this->event->id,
            ]
        ];
    }
}
