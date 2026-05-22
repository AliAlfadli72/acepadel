<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Channels\FcmChannel;
use App\Models\Booking;

class BookingPendingNotification extends Notification
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
        $titleAr = 'طلب حجز الملعب قيد الانتظار ⏳';
        $msgAr = 'تم استلام طلب حجزك لتاريخ ' . $this->booking->start_time->format('Y-m-d') . ' في تمام الساعة ' . $this->booking->start_time->format('H:i') . '. بانتظار موافقة الإدارة.';

        $titleEn = 'Court Booking Pending ⏳';
        $msgEn = 'Your booking request on ' . $this->booking->start_time->format('Y-m-d') . ' at ' . $this->booking->start_time->format('H:i') . ' has been received and is pending admin approval.';

        return [
            'title_ar' => $titleAr,
            'message_ar' => $msgAr,
            'title_en' => $titleEn,
            'message_en' => $msgEn,
            'title' => $titleAr,
            'message' => $msgAr,
            'type' => 'booking',
            'booking_id' => $this->booking->id,
        ];
    }

    public function toFcm($notifiable)
    {
        $locale = $notifiable->locale ?? 'ar';

        $title = $locale === 'en' ? 'Court Booking Pending ⏳' : 'طلب حجز الملعب قيد الانتظار ⏳';
        $body = $locale === 'en'
            ? 'Your booking request on ' . $this->booking->start_time->format('Y-m-d') . ' at ' . $this->booking->start_time->format('H:i') . ' has been received and is pending admin approval.'
            : 'تم استلام طلب حجزك لتاريخ ' . $this->booking->start_time->format('Y-m-d') . ' في تمام الساعة ' . $this->booking->start_time->format('H:i') . '. بانتظار موافقة الإدارة.';

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

