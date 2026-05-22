<?php

namespace App\Models;

use App\Services\RankService;
use Illuminate\Database\Eloquent\Model;

class PlayerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'rank_level',
        'points',
        'matches_played',
        'matches_won',
    ];

    /**
     * احسب المستوى تلقائياً من النقاط قبل كل حفظ.
     */
    protected static function booted(): void
    {
        static::saving(function (PlayerProfile $profile) {
            $profile->rank_level = RankService::getLevelLabel($profile->points ?? 0);
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Accessor: حرف المستوى (D/C/B/A/S) بناءً على النقاط الحالية.
     */
    public function getLevelLetterAttribute(): string
    {
        return RankService::getLevelLetter($this->points ?? 0);
    }

    /**
     * Accessor: معلومات كاملة عن المستوى.
     */
    public function getRankInfoAttribute(): array
    {
        return RankService::getInfo($this->points ?? 0);
    }
}
