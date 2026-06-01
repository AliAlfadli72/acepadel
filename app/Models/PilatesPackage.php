<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PilatesPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'total_classes',
        'price',
        'valid_days',
    ];

    protected $casts = [
        'total_classes' => 'integer',
        'price' => 'decimal:2',
        'valid_days' => 'integer',
    ];

    /**
     * Get user purchases of this package.
     */
    public function userPurchases(): HasMany
    {
        return $this->hasMany(UserPilatesPackage::class);
    }
}
