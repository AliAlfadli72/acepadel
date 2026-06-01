<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Channels\FcmChannel;
use App\Models\PilatesBooking;

class PilatesBookingConfirmedNotification extends Notification
{
    use Queueable;

    protected PilatesBooking $booking;

    public function __construct(PilatesBooking $booking)
    {
        $this->booking = $booking;
    }

    public function via($notifiable)
    {
        return ['database', FcmChannel::class];
    }

    public function toDatabase($notifiable)
    {
        $session = $this->booking->pilatesSession;
        $dateStr = $session->session_date ? $session->session_date->format('Y-m-d') : '';
        $timeStr = $session->start_time;

        $titleAr = 'تأكيد حجز البيلاتس 🧘‍♀️';
        $msgAr = 'تم تأكيد حجزك بنجاح لجلسة "' . $session->title . '" بتاريخ ' . $dateStr . ' الساعة ' . $timeStr;

        $titleEn = 'Pilates Booking Confirmed 🧘‍♀️';
        $msgEn = 'Your booking for "' . $session->title . '" on ' . $dateStr . ' at ' . $timeStr . ' has been confirmed.';

        return [
            'title_ar' => $titleAr,
            'message_ar' => $msgAr,
            'title_en' => $titleEn,
            'message_en' => $msgEn,
            'title' => $titleAr,
            'message' => $msgAr,
            'type' => 'booking',
            'pilates_booking_id' => $this->booking->id,
        ];
    }

    public function toFcm($notifiable)
    {
        $locale = $notifiable->locale ?? 'ar';
        $session = $this->booking->pilatesSession;
        $dateStr = $session->session_date ? $session->session_date->format('Y-m-d') : '';
        $timeStr = $session->start_time;

        $title = $locale === 'en' ? 'Pilates Booking Confirmed 🧘‍♀️' : 'تأكيد حجز البيلاتس 🧘‍♀️';
        $body = $locale === 'en'
            ? 'Your booking for "' . $session->title . '" on ' . $dateStr . ' at ' . $timeStr . ' has been confirmed.'
            : 'تم تأكيد حجزك بنجاح لجلسة "' . $session->title . '" بتاريخ ' . $dateStr . ' الساعة ' . $timeStr;

        return [
            'title' => $title,
            'body' => $body,
            'data' => [
                'type' => 'booking',
                'pilates_booking_id' => (string) $this->booking->id,
            ]
        ];
    }
}
