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
        return [
            'title' => 'إلغاء حجز الملعب ❌',
            'message' => 'تم إلغاء حجزك بنجاح لتاريخ ' . $this->booking->start_time->format('Y-m-d') . ' في تمام الساعة ' . $this->booking->start_time->format('H:i') . '. تم استرداد الرصيد إلى محفظتك.',
            'type' => 'booking_cancelled',
            'booking_id' => $this->booking->id,
        ];
    }

    public function toFcm($notifiable)
    {
        return [
            'title' => 'إلغاء حجز الملعب ❌',
            'body' => 'تم إلغاء حجزك بنجاح لتاريخ ' . $this->booking->start_time->format('Y-m-d') . '. تم استرداد الرصيد إلى محفظتك.',
            'data' => [
                'type' => 'booking_cancelled',
                'booking_id' => (string) $this->booking->id,
            ]
        ];
    }
}
