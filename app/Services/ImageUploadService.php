<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\Image\Image;

class ImageUploadService
{
    /**
     * Upload image and convert to WebP
     * while keeping original dimensions.
     */
    public static function upload(
        $file,
        string $folder = 'uploads',
        ?string $oldImage = null,
        int $quality = 100
    ): string {

        // Delete old image if exists
        if ($oldImage) {
            Storage::disk('public')->delete($oldImage);
        }

        // Generate unique filename
        $filename = Str::uuid() . '.webp';

        // Create folder if it does not exist
        if (!Storage::disk('public')->exists($folder)) {
            Storage::disk('public')->makeDirectory($folder);
        }

        // Final full path
        $fullPath = storage_path('app/public/' . $folder . '/' . $filename);

        /**
         * Convert to WebP
         * while keeping:
         * - original width
         * - original height
         * - original aspect ratio
         * - highest possible quality
         */
        Image::load($file->getPathname())
            ->format('webp')
            ->quality($quality)
            ->save($fullPath);

        // Return path to save in DB
        return $folder . '/' . $filename;
    }

    /**
     * Delete image from storage
     */
    public static function delete(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }
}