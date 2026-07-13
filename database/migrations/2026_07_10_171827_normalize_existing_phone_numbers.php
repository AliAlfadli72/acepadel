<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $users = \App\Models\User::all();
        foreach ($users as $user) {
            if ($user->phone && !str_starts_with($user->phone, 'DUMMY_')) {
                $normalized = \App\Models\User::normalizePhone($user->phone);
                
                // التأكد من عدم وجود تكرار لنفس الرقم بعد توحيده
                $exists = \App\Models\User::where('phone', $normalized)
                    ->where('id', '!=', $user->id)
                    ->exists();
                
                if (!$exists && $normalized !== $user->phone) {
                    // سيقوم الـ Mutator بتوحيده تلقائياً أيضاً عند التعيين
                    $user->phone = $normalized;
                    $user->save();
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // لا حاجة للتراجع لأن البيانات تم توحيدها وصيانتها
    }
};
