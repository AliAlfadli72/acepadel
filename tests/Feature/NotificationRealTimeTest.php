<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Court;
use App\Models\Booking;
use App\Events\NotificationBroadcasted;
use App\Notifications\BookingPendingNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class NotificationRealTimeTest extends TestCase
{
    use RefreshDatabase;

    public function test_sending_notification_broadcasts_event()
    {
        Event::fake([
            NotificationBroadcasted::class
        ]);

        $this->withoutExceptionHandling();

        $user = User::factory()->create();
        $user->refresh();

        $court = Court::create([
            'name' => 'Court A',
            'type' => 'indoor',
            'price' => 50000.00,
            'is_active' => true
        ]);

        $booking = Booking::create([
            'user_id' => $user->id,
            'court_id' => $court->id,
            'start_time' => now()->addDays(1),
            'end_time' => now()->addDays(1)->addHour(),
            'status' => 'pending',
            'total_price' => 50000.00,
            'payment_status' => 'unpaid',
        ]);

        // Send a notification that saves to the database
        $user->notify(new BookingPendingNotification($booking));

        // Assert NotificationBroadcasted event was dispatched
        Event::assertDispatched(NotificationBroadcasted::class);
    }
}
