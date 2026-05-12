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
        return [
            'title' => 'تأكيد حجز الملعب 🎾',
            'message' => 'تم تأكيد حجزك بنجاح لتاريخ ' . $this->booking->start_time->format('Y-m-d') . ' في تمام الساعة ' . $this->booking->start_time->format('H:i'),
            'type' => 'booking',
            'booking_id' => $this->booking->id,
        ];
    }

    public function toFcm($notifiable)
    {
        return [
            'title' => 'تأكيد حجز الملعب 🎾',
            'body' => 'تم تأكيد حجزك بنجاح لتاريخ ' . $this->booking->start_time->format('Y-m-d') . ' في تمام الساعة ' . $this->booking->start_time->format('H:i'),
            'data' => [
                'type' => 'booking',
                'booking_id' => (string) $this->booking->id,
            ]
        ];
    }
}
