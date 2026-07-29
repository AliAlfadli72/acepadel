<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TournamentCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'tournament_id',
        'name',
        'max_teams',
        'fee',
        'format',
    ];

    protected $casts = [
        'fee' => 'decimal:2',
        'max_teams' => 'integer',
    ];

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function teams()
    {
        return $this->hasMany(TournamentTeam::class);
    }

    public function matches()
    {
        return $this->hasMany(TournamentMatch::class);
    }
}
