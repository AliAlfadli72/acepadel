<?php

use App\Services\ImageUploadService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Image\Image;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('image upload service converts image to webp and fits it to max dimensions', function () {
    Storage::fake('public');

    // Create a fake image with large dimensions
    $file = UploadedFile::fake()->image('large_avatar.png', 1600, 1000);

    // Upload the file
    $path = ImageUploadService::upload($file, 'profiles');

    // Assert that the file is stored under the public disk
    Storage::disk('public')->assertExists($path);
    
    // Assert extension is webp
    expect(pathinfo($path, PATHINFO_EXTENSION))->toBe('webp');

    // Get absolute path to verify with Spatie Image
    $absolutePath = Storage::disk('public')->path($path);
    $image = Image::load($absolutePath);

    // Dimensions should be scaled down maintaining aspect ratio (max 1200 width)
    // 1600x1000 scaled down to fit 1200x1200 max is 1200x750.
    expect($image->getWidth())->toBe(1200)
        ->and($image->getHeight())->toBe(750);
});

test('image upload service deletes old image', function () {
    Storage::fake('public');

    $oldFile = UploadedFile::fake()->image('old.webp');
    $oldPath = ImageUploadService::upload($oldFile, 'profiles');

    Storage::disk('public')->assertExists($oldPath);

    $newFile = UploadedFile::fake()->image('new.jpg');
    $newPath = ImageUploadService::upload($newFile, 'profiles', $oldPath);

    // Old image should be deleted
    Storage::disk('public')->assertMissing($oldPath);
    // New image should exist
    Storage::disk('public')->assertExists($newPath);
});
