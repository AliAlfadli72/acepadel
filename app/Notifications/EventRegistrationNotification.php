<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Channels\FcmChannel;
use App\Models\Event;

class EventRegistrationNotification extends Notification
{
    use Queueable;

    protected Event $event;
    protected string $registrationStatus; // 'pending' | 'approved' | 'rejected'

    public function __construct(Event $event, string $registrationStatus = 'pending')
    {
        $this->event              = $event;
        $this->registrationStatus = $registrationStatus;
    }

    public function via($notifiable)
    {
        return ['database', FcmChannel::class];
    }

    private function getContentByLocale($locale): array
    {
        $title = $locale === 'en' ? $this->event->title_en : $this->event->title_ar;

        if ($locale === 'en') {
            return match ($this->registrationStatus) {
                'pending'  => [
                    'title'   => 'Event Registration Request ⏳',
                    'message' => "Your registration request for the event: {$title} has been submitted. It will be reviewed by the administration soon.",
                ],
                'approved' => [
                    'title'   => 'Registration Approved 🏆',
                    'message' => "Congratulations! Your registration for the event: {$title} has been approved. The fee has been deducted from your wallet.",
                ],
                'rejected' => [
                    'title'   => 'Registration Rejected ❌',
                    'message' => "Sorry, your registration request for the event: {$title} has been rejected. You can contact the administration for details.",
                ],
                default    => [
                    'title'   => 'Event Registration Update',
                    'message' => "Your registration status for the event: {$title} has been updated.",
                ],
            };
        }

        return match ($this->registrationStatus) {
            'pending'  => [
                'title'   => 'طلب تسجيل في فعالية ⏳',
                'message' => "تم إرسال طلب تسجيلك في فعالية: {$title}. سيتم مراجعته من قِبل الإدارة قريباً.",
            ],
            'approved' => [
                'title'   => 'تمت الموافقة على تسجيلك 🏆',
                'message' => "مبروك! تمت الموافقة على تسجيلك في فعالية: {$title}. تم خصم رسوم التسجيل من محفظتك.",
            ],
            'rejected' => [
                'title'   => 'تم رفض طلب التسجيل ❌',
                'message' => "نأسف، تم رفض طلب تسجيلك في فعالية: {$title}. يمكنك التواصل مع الإدارة لمزيد من المعلومات.",
            ],
            default    => [
                'title'   => 'تحديث تسجيل الفعالية',
                'message' => "تم تحديث حالة تسجيلك في فعالية: {$title}.",
            ],
        };
    }

    public function toDatabase($notifiable)
    {
        $contentAr = $this->getContentByLocale('ar');
        $contentEn = $this->getContentByLocale('en');

        return [
            'title_ar'            => $contentAr['title'],
            'message_ar'          => $contentAr['message'],
            'title_en'            => $contentEn['title'],
            'message_en'          => $contentEn['message'],
            // Fallback default
            'title'               => $contentAr['title'],
            'message'             => $contentAr['message'],
            'type'                => 'event_registration',
            'event_id'            => $this->event->id,
            'registration_status' => $this->registrationStatus,
        ];
    }

    public function toFcm($notifiable)
    {
        $locale = $notifiable->locale ?? 'ar';
        $content = $this->getContentByLocale($locale);

        return [
            'title' => $content['title'],
            'body'  => $content['message'],
            'data'  => [
                'type'                => 'event_registration',
                'event_id'            => (string) $this->event->id,
                'registration_status' => $this->registrationStatus,
            ],
        ];
    }
}
