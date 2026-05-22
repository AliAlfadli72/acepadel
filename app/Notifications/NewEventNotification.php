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
        $titleAr = 'فعالية جديدة متاحة 🌟';
        $msgAr = 'تم إضافة فعالية جديدة: ' . $this->event->title_ar . '. سجل الآن قبل اكتمال العدد!';

        $titleEn = 'New Event Available 🌟';
        $msgEn = 'A new event has been added: ' . $this->event->title_en . '. Register now before slots run out!';

        return [
            'title_ar' => $titleAr,
            'message_ar' => $msgAr,
            'title_en' => $titleEn,
            'message_en' => $msgEn,
            // Fallback default
            'title' => $titleAr,
            'message' => $msgAr,
            'type' => 'new_event',
            'event_id' => $this->event->id,
        ];
    }

    public function toFcm($notifiable)
    {
        $locale = $notifiable->locale ?? 'ar';

        $title = $locale === 'en' ? 'New Event Available 🌟' : 'فعالية جديدة متاحة 🌟';
        $body = $locale === 'en'
            ? 'A new event has been added: ' . $this->event->title_en . '. Register now before slots run out!'
            : 'تم إضافة فعالية جديدة: ' . $this->event->title_ar . '. سجل الآن قبل اكتمال العدد!';

        return [
            'title' => $title,
            'body' => $body,
            'data' => [
                'type' => 'new_event',
                'event_id' => (string) $this->event->id,
            ]
        ];
    }
}
