<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TournamentMatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'tournament_category_id',
        'round',
        'match_number',
        'next_match_id',
        'next_match_slot',
        'team1_id',
        'team2_id',
        'winner_id',
        'court_id',
        'scheduled_date',
        'scheduled_time',
        'score_team1',
        'score_team2',
        'status',
    ];

    protected $casts = [
        'round' => 'integer',
        'match_number' => 'integer',
        'scheduled_date' => 'date',
    ];

    public function category()
    {
        return $this->belongsTo(TournamentCategory::class, 'tournament_category_id');
    }

    public function team1()
    {
        return $this->belongsTo(TournamentTeam::class, 'team1_id');
    }

    public function team2()
    {
        return $this->belongsTo(TournamentTeam::class, 'team2_id');
    }

    public function winner()
    {
        return $this->belongsTo(TournamentTeam::class, 'winner_id');
    }

    public function nextMatch()
    {
        return $this->belongsTo(TournamentMatch::class, 'next_match_id');
    }

    public function court()
    {
        return $this->belongsTo(Court::class, 'court_id');
    }
}
