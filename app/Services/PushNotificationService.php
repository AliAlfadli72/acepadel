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
            $messageArray = [
                'token' => $user->fcm_token,
                'notification' => [
                    'title' => $title,
                    'body' => $body,
                ],
                'data' => array_map('strval', $data),
                'android' => [
                    'priority' => 'high',
                    'notification' => [
                        'channel_id' => 'ace_padel_channel',
                        'sound' => 'default',
                        'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                    ],
                ],
                'apns' => [
                    'headers' => [
                        'apns-priority' => '10',
                    ],
                    'payload' => [
                        'aps' => [
                            'sound' => 'default',
                            'badge' => 1,
                        ],
                    ],
                ],
            ];

            $message = CloudMessage::fromArray($messageArray);

            $this->messaging->send($message);
            return true;
        } catch (\Throwable $e) {
            // Log the error
            \Log::error('Firebase Push Error: ' . $e->getMessage());
            return false;
        }
    }
}
