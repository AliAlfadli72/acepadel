<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Court;
use App\Models\Booking;
use App\Models\Wallet;
use App\Services\BookingService;
use App\Events\BookingStatusUpdated;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class BookingRealTimeTest extends TestCase
{
    use RefreshDatabase;

    public function test_booking_cancelled_event_is_dispatched()
    {
        Event::fake([
            BookingStatusUpdated::class
        ]);

        $user = User::factory()->create();
        $user->refresh();
        $user->wallet->update(['balance' => 100000.00]);

        $court = Court::create([
            'name' => 'Court A',
            'type' => 'indoor',
            'price' => 50000.00,
            'is_active' => true
        ]);

        $service = app(BookingService::class);

        $booking = Booking::create([
            'user_id' => $user->id,
            'court_id' => $court->id,
            'start_time' => now()->addDays(1),
            'end_time' => now()->addDays(1)->addHour(),
            'status' => 'pending',
            'total_price' => 50000.00,
            'payment_status' => 'unpaid',
        ]);

        $service->cancelBooking($booking, $user);

        $this->assertEquals('cancelled', $booking->fresh()->status);

        Event::assertDispatched(BookingStatusUpdated::class, function ($event) use ($booking) {
            return $event->bookingId === $booking->id && $event->status === 'cancelled';
        });
    }

    public function test_booking_completed_event_is_dispatched()
    {
        Event::fake([
            BookingStatusUpdated::class
        ]);

        $this->withoutExceptionHandling();

        $this->artisan('db:seed', ['--class' => 'Database\Seeders\PermissionSeeder']);

        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        // Clear Spatie cached permissions
        $this->app->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        // Assert permissions
        $this->assertTrue($admin->hasPermissionTo('players.edit'));

        $user = User::factory()->create();
        $user->refresh();
        $user->wallet->update(['balance' => 100000.00]);

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
            'status' => 'approved',
            'total_price' => 50000.00,
            'payment_status' => 'unpaid',
        ]);

        $response = $this->actingAs($admin)
            ->from('/admin/bookings')
            ->post("/admin/bookings/{$booking->id}/complete");

        $response->assertRedirect();
        $this->assertEquals('completed', $booking->fresh()->status);

        Event::assertDispatched(BookingStatusUpdated::class, function ($event) use ($booking) {
            return $event->bookingId === $booking->id && $event->status === 'completed';
        });
    }
}
