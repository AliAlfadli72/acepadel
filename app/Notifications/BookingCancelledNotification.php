<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Channels\FcmChannel;
use App\Models\Booking;

class BookingCancelledNotification extends Notification
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
        $titleAr = 'إلغاء حجز الملعب ❌';
        $msgAr = 'تم إلغاء حجزك بنجاح لتاريخ ' . $this->booking->start_time->format('Y-m-d') . ' في تمام الساعة ' . $this->booking->start_time->format('H:i') . '. تم استرداد الرصيد إلى محفظتك.';
        
        $titleEn = 'Court Booking Cancelled ❌';
        $msgEn = 'Your booking on ' . $this->booking->start_time->format('Y-m-d') . ' at ' . $this->booking->start_time->format('H:i') . ' has been cancelled. The amount has been refunded to your wallet.';

        return [
            'title_ar' => $titleAr,
            'message_ar' => $msgAr,
            'title_en' => $titleEn,
            'message_en' => $msgEn,
            // Fallback default
            'title' => $titleAr,
            'message' => $msgAr,
            'type' => 'booking_cancelled',
            'booking_id' => $this->booking->id,
        ];
    }

    public function toFcm($notifiable)
    {
        $locale = $notifiable->locale ?? 'ar';
        
        $title = $locale === 'en' ? 'Court Booking Cancelled ❌' : 'إلغاء حجز الملعب ❌';
        $body = $locale === 'en'
            ? 'Your booking on ' . $this->booking->start_time->format('Y-m-d') . ' has been cancelled. The amount has been refunded to your wallet.'
            : 'تم إلغاء حجزك بنجاح لتاريخ ' . $this->booking->start_time->format('Y-m-d') . '. تم استرداد الرصيد إلى محفظتك.';

        return [
            'title' => $title,
            'body' => $body,
            'data' => [
                'type' => 'booking_cancelled',
                'booking_id' => (string) $this->booking->id,
            ]
        ];
    }
}
