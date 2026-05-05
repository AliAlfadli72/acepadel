<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffProfile extends Model
{
    protected $fillable = [
        'user_id',
        'position',
        'shift_name',
        'shift_start',
        'shift_end',
        'working_days',
    ];

    protected $casts = [
        'working_days' => 'array',
        'shift_start' => 'datetime:H:i',
        'shift_end' => 'datetime:H:i',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
