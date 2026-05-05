<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// هذا الرابط (API) سيزود تطبيق الموبايل بمعلومات الأكاديمية
Route::get('/academy-info', function () {
    return response()->json([
        'status' => 'success',
        'data' => [
            'name' => 'آيس بادل أكاديمي',
            'location' => 'دمشق — أوتوستراد الفيحاء',
            'description' => 'الوجهة الرياضية والاجتماعية الأولى في قلب دمشق. نجمع بين التميز الرياضي ومعايير الاتحاد الدولي (FIP) لنقدم تجربة لا تضاهى.',
        ]
    ]);
});

use App\Models\Court; // تأكد من استدعاء الموديل الخاص بالملاعب

Route::get('/courts', function () {
    return response()->json(Court::all()); 
});