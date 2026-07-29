<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tournament extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title_ar',
        'title_en',
        'desc_ar',
        'desc_en',
        'location_ar',
        'location_en',
        'prize_pool',
        'start_date',
        'end_date',
        'banner_image',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    protected $appends = ['title', 'desc', 'location'];

    public function getTitleAttribute()
    {
        return app()->getLocale() === 'ar' ? $this->title_ar : $this->title_en;
    }

    public function getDescAttribute()
    {
        return app()->getLocale() === 'ar' ? $this->desc_ar : $this->desc_en;
    }

    public function getLocationAttribute()
    {
        return app()->getLocale() === 'ar' ? $this->location_ar : $this->location_en;
    }

    public function categories()
    {
        return $this->hasMany(TournamentCategory::class);
    }
}
