<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Channels\FcmChannel;
use App\Models\PilatesSession;

class PilatesSessionCancelledNotification extends Notification
{
    use Queueable;

    protected PilatesSession $session;

    public function __construct(PilatesSession $session)
    {
        $this->session = $session;
    }

    public function via($notifiable)
    {
        return ['database', FcmChannel::class];
    }

    public function toDatabase($notifiable)
    {
        $dateStr = $this->session->session_date ? $this->session->session_date->format('Y-m-d') : '';
        $timeStr = $this->session->start_time;

        $titleAr = 'إلغاء جلسة البيلاتس 🧘‍♀️';
        $msgAr = 'نأسف لإبلاغكم بأنه تم إلغاء جلسة البيلاتس "' . $this->session->title . '" المقررة بتاريخ ' . $dateStr . ' الساعة ' . $timeStr;

        $titleEn = 'Pilates Session Cancelled 🧘‍♀️';
        $msgEn = 'We regret to inform you that the Pilates session "' . $this->session->title . '" scheduled on ' . $dateStr . ' at ' . $timeStr . ' has been cancelled.';

        return [
            'title_ar' => $titleAr,
            'message_ar' => $msgAr,
            'title_en' => $titleEn,
            'message_en' => $msgEn,
            'title' => $titleAr,
            'message' => $msgAr,
            'type' => 'booking_cancelled',
            'pilates_session_id' => $this->session->id,
        ];
    }

    public function toFcm($notifiable)
    {
        $locale = $notifiable->locale ?? 'ar';
        $dateStr = $this->session->session_date ? $this->session->session_date->format('Y-m-d') : '';
        $timeStr = $this->session->start_time;

        $title = $locale === 'en' ? 'Pilates Session Cancelled 🧘‍♀️' : 'إلغاء جلسة البيلاتس 🧘‍♀️';
        $body = $locale === 'en'
            ? 'We regret to inform you that the Pilates session "' . $this->session->title . '" scheduled on ' . $dateStr . ' at ' . $timeStr . ' has been cancelled.'
            : 'نأسف لإبلاغكم بأنه تم إلغاء جلسة البيلاتس "' . $this->session->title . '" المقررة بتاريخ ' . $dateStr . ' الساعة ' . $timeStr;

        return [
            'title' => $title,
            'body' => $body,
            'data' => [
                'type' => 'booking_cancelled',
                'pilates_session_id' => (string) $this->session->id,
            ]
        ];
    }
}
