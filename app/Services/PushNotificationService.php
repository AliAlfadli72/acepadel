<?php

namespace App\Services;

use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

class PushNotificationService
{
    protected Messaging $messaging;

    public function __construct(Messaging $messaging)
    {
        $this->messaging = $messaging;
    }

    public function sendToUser($user, $title, $body, $data = [])
    {
        if (!$user || !$user->fcm_token) {
            return false;
        }

        if ($user instanceof \App\Models\User) {
            $type = $data['type'] ?? '';
            
            // Check booking notification preference
            if (in_array($type, ['booking', 'booking_cancelled']) || isset($data['booking_id'])) {
                if (!$user->notif_bookings) {
                    \Log::info("Notification of type '{$type}' suppressed for user {$user->id} due to notif_bookings preference.");
                    return false;
                }
            }
            
            // Check event notification preference
            if (in_array($type, ['new_event', 'event_registration']) || isset($data['event_id'])) {
                if (!$user->notif_events) {
                    \Log::info("Notification of type '{$type}' suppressed for user {$user->id} due to notif_events preference.");
                    return false;
                }
            }
            
            // Check offer notification preference
            if (in_array($type, ['offer', 'promotion', 'marketing'])) {
                if (!$user->notif_offers) {
                    \Log::info("Notification of type '{$type}' suppressed for user {$user->id} due to notif_offers preference.");
                    return false;
                }
            }
        }

        try {
            $notification = Notification::create($title, $body);
            
            $androidConfig = \Kreait\Firebase\Messaging\AndroidConfig::fromArray([
                'priority' => 'high',
                'notification' => [
                    'channel_id' => 'ace_padel_channel',
                    'sound' => 'default',
                    'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                ],
            ]);

            $apnsConfig = \Kreait\Firebase\Messaging\ApnsConfig::fromArray([
                'headers' => [
                    'apns-priority' => '10',
                ],
                'payload' => [
                    'aps' => [
                        'sound' => 'default',
                        'badge' => 1,
                    ],
                ],
            ]);

            $message = CloudMessage::withTarget('token', $user->fcm_token)
                ->withNotification($notification)
                ->withData($data)
                ->withAndroidConfig($androidConfig)
                ->withApnsConfig($apnsConfig);

            $this->messaging->send($message);
            return true;
        } catch (\Exception $e) {
            // Log the error
            \Log::error('Firebase Push Error: ' . $e->getMessage());
            return false;
        }
    }
}
