<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Event extends Model
{
        use SoftDeletes;
    protected $fillable = [
        'title_ar', 'title_en', 'desc_ar', 'desc_en',
        'category', 'level', 'date', 'time', 'fee',
        'prize_ar', 'prize_en', 'max_participants',
        'color_class', 'image_path', 'status'
    ];

    protected $casts = [
        'date' => 'date',
        'time' => 'datetime',
        'fee' => 'decimal:2',
    ];

    protected $appends = ['title', 'desc', 'prize'];

    public function getTitleAttribute()
    {
        return app()->getLocale() === 'ar' ? $this->title_ar : $this->title_en;
    }

    public function getDescAttribute()
    {
        return app()->getLocale() === 'ar' ? $this->desc_ar : $this->desc_en;
    }

    public function getPrizeAttribute()
    {
        return app()->getLocale() === 'ar' ? $this->prize_ar : $this->prize_en;
    }

    public function registrations()
    {
        return $this->hasMany(EventRegistration::class);
    }


}
