<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Expense extends Model
{
    use SoftDeletes;

    protected $fillable = [

        'title',
        'description',
        'category',
        'type',
        'amount',
        'expense_date',
        'starts_at',
        'ends_at',
        'active',
        'invoice_path',
        'created_by',
    ];

    protected $casts = [

        'active' => 'boolean',

        'expense_date' => 'date',

        'starts_at' => 'date',

        'ends_at' => 'date',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}