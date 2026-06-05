<?php

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('terms page renders successfully', function () {
    $response = $this->get('/terms');
    $response->assertStatus(200);
});

test('privacy page renders successfully', function () {
    $response = $this->get('/privacy');
    $response->assertStatus(200);
});
