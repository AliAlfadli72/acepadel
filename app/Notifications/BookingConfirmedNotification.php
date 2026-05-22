<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Channels\FcmChannel;
use App\Models\Booking;

class BookingConfirmedNotification extends Notification
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
        $titleAr = 'تأكيد حجز الملعب 🎾';
        $msgAr = 'تم تأكيد حجزك بنجاح لتاريخ ' . $this->booking->start_time->format('Y-m-d') . ' في تمام الساعة ' . $this->booking->start_time->format('H:i');

        $titleEn = 'Court Booking Confirmed 🎾';
        $msgEn = 'Your booking on ' . $this->booking->start_time->format('Y-m-d') . ' at ' . $this->booking->start_time->format('H:i') . ' has been successfully confirmed.';

        return [
            'title_ar' => $titleAr,
            'message_ar' => $msgAr,
            'title_en' => $titleEn,
            'message_en' => $msgEn,
            // Fallback default
            'title' => $titleAr,
            'message' => $msgAr,
            'type' => 'booking',
            'booking_id' => $this->booking->id,
        ];
    }

    public function toFcm($notifiable)
    {
        $locale = $notifiable->locale ?? 'ar';

        $title = $locale === 'en' ? 'Court Booking Confirmed 🎾' : 'تأكيد حجز الملعب 🎾';
        $body = $locale === 'en'
            ? 'Your booking on ' . $this->booking->start_time->format('Y-m-d') . ' at ' . $this->booking->start_time->format('H:i') . ' has been successfully confirmed.'
            : 'تم تأكيد حجزك بنجاح لتاريخ ' . $this->booking->start_time->format('Y-m-d') . ' في تمام الساعة ' . $this->booking->start_time->format('H:i');

        return [
            'title' => $title,
            'body' => $body,
            'data' => [
                'type' => 'booking',
                'booking_id' => (string) $this->booking->id,
            ]
        ];
    }
}
