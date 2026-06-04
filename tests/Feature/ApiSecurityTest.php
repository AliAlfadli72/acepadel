<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('unauthenticated users cannot access private api routes', function () {
    $response = $this->getJson('/api/profile');
    $response->assertStatus(401);
});

test('api routes have rate limiting headers', function () {
    $user = User::factory()->create();
    
    // Seed roles since UserFactory might trigger role assignments or other relations
    $this->seed(\Database\Seeders\RoleSeeder::class);
    $user->assignRole('Player');

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/profile');
    
    $response->assertHeader('X-RateLimit-Limit');
    $response->assertHeader('X-RateLimit-Remaining');
});

test('api validation custom error format matches for register', function () {
    $response = $this->postJson('/api/register', []);
    
    $response->assertStatus(422)
        ->assertJson([
            'status' => 'error',
            'message' => 'بيانات التحقق غير صالحة.',
        ])
        ->assertJsonStructure(['errors']);
});
