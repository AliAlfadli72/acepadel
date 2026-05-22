<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Channels\FcmChannel;
use App\Models\Booking;

class CoachSessionConfirmedNotification extends Notification
{
    use Queueable;

    protected Booking $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    public function via($notifiable)
    {
        return ['database', FcmChannel::class];
    }

    public function toDatabase($notifiable)
    {
        $playerName = $this->booking->user ? $this->booking->user->name : ($this->booking->guest_name ?? 'لاعب');
        
        $titleAr = 'جلسة تدريبية جديدة مؤكدة 🎾';
        $msgAr = 'تم تأكيد جلسة تدريبية جديدة معك للاعب ' . $playerName . ' بتاريخ ' . $this->booking->start_time->format('Y-m-d') . ' في تمام الساعة ' . $this->booking->start_time->format('H:i');

        $titleEn = 'New Training Session Confirmed 🎾';
        $msgEn = 'A new training session has been confirmed with player ' . $playerName . ' on ' . $this->booking->start_time->format('Y-m-d') . ' at ' . $this->booking->start_time->format('H:i');

        return [
            'title_ar' => $titleAr,
            'message_ar' => $msgAr,
            'title_en' => $titleEn,
            'message_en' => $msgEn,
            // Fallback default
            'title' => $titleAr,
            'message' => $msgAr,
            'type' => 'coach_session',
            'booking_id' => $this->booking->id,
        ];
    }

    public function toFcm($notifiable)
    {
        $locale = $notifiable->locale ?? 'ar';
        $playerName = $this->booking->user ? $this->booking->user->name : ($this->booking->guest_name ?? 'لاعب');

        $title = $locale === 'en' ? 'New Training Session Confirmed 🎾' : 'جلسة تدريبية جديدة مؤكدة 🎾';
        $body = $locale === 'en'
            ? 'A new training session has been confirmed with player ' . $playerName . ' on ' . $this->booking->start_time->format('Y-m-d') . ' at ' . $this->booking->start_time->format('H:i') . '.'
            : 'تم تأكيد جلسة تدريبية جديدة معك للاعب ' . $playerName . ' بتاريخ ' . $this->booking->start_time->format('Y-m-d') . ' في تمام الساعة ' . $this->booking->start_time->format('H:i');

        return [
            'title' => $title,
            'body' => $body,
            'data' => [
                'type' => 'coach_session',
                'booking_id' => (string) $this->booking->id,
            ]
        ];
    }
}
