<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TournamentTeam extends Model
{
    use HasFactory;

    protected $fillable = [
        'tournament_category_id',
        'team_name',
        'player1_id',
        'player2_id',
        'player2_name',
        'seed',
        'status',
    ];

    protected $appends = ['display_name'];

    public function category()
    {
        return $this->belongsTo(TournamentCategory::class, 'tournament_category_id');
    }

    public function player1()
    {
        return $this->belongsTo(User::class, 'player1_id');
    }

    public function player2()
    {
        return $this->belongsTo(User::class, 'player2_id');
    }

    public function getDisplayNameAttribute()
    {
        if ($this->team_name) {
            return $this->team_name;
        }

        $p1 = $this->player1 ? $this->player1->name : 'Player 1';
        $p2 = $this->player2 ? $this->player2->name : ($this->player2_name ?? 'Player 2');

        return "{$p1} + {$p2}";
    }
}
