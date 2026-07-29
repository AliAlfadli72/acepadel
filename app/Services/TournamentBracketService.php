<?php

namespace App\Services;

use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\TournamentTeam;
use Illuminate\Support\Facades\DB;

class TournamentBracketService
{
    /**
     * Generate complete Knockout Bracket Tree for a category.
     *
     * @param TournamentCategory $category
     * @return array
     */
    public function generateBracket(TournamentCategory $category)
    {
        return DB::transaction(function () use ($category) {
            // Delete existing matches for fresh generation
            TournamentMatch::where('tournament_category_id', $category->id)->delete();

            $teams = $category->teams()->where('status', 'confirmed')->get();
            $teamCount = $teams->count();

            if ($teamCount < 2) {
                throw new \Exception('At least 2 confirmed teams are required to generate a bracket.');
            }

            // Determine next power of 2 for bracket size (2, 4, 8, 16, 32)
            $bracketSize = 2;
            while ($bracketSize < $teamCount) {
                $bracketSize *= 2;
            }

            // Shuffle or use seeds for team distribution
            $shuffledTeams = $teams->sortBy(function ($team) {
                return $team->seed ?? rand(1, 999);
            })->values();

            // Calculate rounds (e.g., 16 -> 8 -> 4 -> 2)
            $rounds = [];
            $currentRoundSize = $bracketSize;
            while ($currentRoundSize >= 2) {
                $rounds[] = $currentRoundSize;
                $currentRoundSize /= 2;
            }

            // Map created matches round by round to link next_match_id
            $previousRoundMatches = [];

            // We iterate backwards from Final (2) up to First Round (e.g., 16)
            $reversedRounds = array_reverse($rounds); // [2, 4, 8, 16]

            foreach ($reversedRounds as $roundIndex => $round) {
                $matchCountInRound = $round / 2;
                $currentRoundMatches = [];

                for ($m = 1; $m <= $matchCountInRound; $m++) {
                    $nextMatchId = null;
                    $nextMatchSlot = null;

                    // If not final round, find parent match created in previous loop step
                    if ($roundIndex > 0) {
                        $parentMatchIndex = (int) ceil($m / 2) - 1;
                        if (isset($previousRoundMatches[$parentMatchIndex])) {
                            $nextMatchId = $previousRoundMatches[$parentMatchIndex]->id;
                            $nextMatchSlot = ($m % 2 !== 0) ? 'team1' : 'team2';
                        }
                    }

                    $matchData = [
                        'tournament_category_id' => $category->id,
                        'round' => $round,
                        'match_number' => $m,
                        'next_match_id' => $nextMatchId,
                        'next_match_slot' => $nextMatchSlot,
                        'status' => 'scheduled',
                    ];

                    // Populate initial teams only for the first round (largest round number e.g. 16)
                    if ($round === $bracketSize) {
                        $team1Index = ($m - 1) * 2;
                        $team2Index = $team1Index + 1;

                        $matchData['team1_id'] = $shuffledTeams[$team1Index]->id ?? null;
                        $matchData['team2_id'] = $shuffledTeams[$team2Index]->id ?? null;
                    }

                    $createdMatch = TournamentMatch::create($matchData);
                    $currentRoundMatches[] = $createdMatch;
                }

                $previousRoundMatches = $currentRoundMatches;
            }

            return $this->getBracketTree($category);
        });
    }

    /**
     * Record score and advance winner to the next match slot.
     */
    public function recordMatchResult(TournamentMatch $match, $winnerId, $scoreTeam1, $scoreTeam2)
    {
        return DB::transaction(function () use ($match, $winnerId, $scoreTeam1, $scoreTeam2) {
            if ($winnerId != $match->team1_id && $winnerId != $match->team2_id) {
                throw new \Exception('Winner must be one of the competing teams in this match.');
            }

            $match->update([
                'winner_id' => $winnerId,
                'score_team1' => $scoreTeam1,
                'score_team2' => $scoreTeam2,
                'status' => 'completed',
            ]);

            // Advance winner to next match if applicable
            if ($match->next_match_id && $match->next_match_slot) {
                $nextMatch = TournamentMatch::find($match->next_match_id);
                if ($nextMatch) {
                    $slotColumn = $match->next_match_slot === 'team1' ? 'team1_id' : 'team2_id';
                    $nextMatch->update([
                        $slotColumn => $winnerId,
                    ]);
                }
            }

            // Auto update Event & Tournament status when Final match (round == 2) completes
            $category = $match->category;
            $tournament = $category ? $category->tournament : null;
            if ($tournament) {
                $event = \App\Models\Event::where('title_ar', $tournament->title_ar)
                    ->orWhere('id', $tournament->id)
                    ->first();

                if ((int)$match->round === 2 && $winnerId) {
                    $tournament->update(['status' => 'completed']);
                    if ($event) {
                        $event->update(['status' => 'completed']);
                    }
                } else {
                    if ($event && $event->status === 'upcoming') {
                        $event->update(['status' => 'ongoing']);
                    }
                }
            }

            // Update PlayerProfile stats (matches_played, matches_won, points)
            $this->updateMatchPlayerStats($match, $winnerId);

            // Auto calculate and update 1st, 2nd, 3rd placements for event registrations
            if ($category) {
                $this->autoUpdatePlacements($category);
            }

            return $match->fresh(['team1', 'team2', 'winner', 'nextMatch']);
        });
    }

    /**
     * Auto calculate and assign 1st, 2nd, 3rd positions to EventRegistrations
     */
    public function autoUpdatePlacements(TournamentCategory $category)
    {
        $tournament = $category->tournament;
        if (!$tournament) return;

        $event = \App\Models\Event::where(function($q) use ($tournament) {
            $q->where('id', $tournament->id);
            if (!empty($tournament->title)) {
                $q->orWhere('title_ar', $tournament->title)->orWhere('title_en', $tournament->title);
            }
            if (!empty($tournament->title_ar)) $q->orWhere('title_ar', $tournament->title_ar);
            if (!empty($tournament->title_en)) $q->orWhere('title_en', $tournament->title_en);
        })->first();
        if (!$event) return;

        // 1. Final match (round == 2)
        $finalMatch = TournamentMatch::where('tournament_category_id', $category->id)
            ->where('round', 2)
            ->where('status', 'completed')
            ->first();

        if ($finalMatch && $finalMatch->winner_id) {
            $winnerTeam = TournamentTeam::find($finalMatch->winner_id);
            $loserTeamId = ($finalMatch->winner_id == $finalMatch->team1_id) ? $finalMatch->team2_id : $finalMatch->team1_id;
            $loserTeam = $loserTeamId ? TournamentTeam::find($loserTeamId) : null;

            // Set 1st Place (placement = 1) for winner team's players
            if ($winnerTeam) {
                $playerIds = array_filter([$winnerTeam->player1_id, $winnerTeam->player2_id]);
                \App\Models\EventRegistration::where('event_id', $event->id)
                    ->whereIn('user_id', $playerIds)
                    ->update(['placement' => 1]);
            }

            // Set 2nd Place (placement = 2) for runner-up team's players
            if ($loserTeam) {
                $playerIds = array_filter([$loserTeam->player1_id, $loserTeam->player2_id]);
                \App\Models\EventRegistration::where('event_id', $event->id)
                    ->whereIn('user_id', $playerIds)
                    ->update(['placement' => 2]);
            }

            // 2. Semi-final matches (round == 4) -> losers get 3rd Place (placement = 3)
            $semiMatches = TournamentMatch::where('tournament_category_id', $category->id)
                ->where('round', 4)
                ->where('status', 'completed')
                ->get();

            foreach ($semiMatches as $semiMatch) {
                if ($semiMatch->winner_id) {
                    $semiLoserId = ($semiMatch->winner_id == $semiMatch->team1_id) ? $semiMatch->team2_id : $semiMatch->team1_id;
                    if ($semiLoserId && $semiLoserId != $winnerTeam?->id && $semiLoserId != $loserTeam?->id) {
                        $semiLoserTeam = TournamentTeam::find($semiLoserId);
                        if ($semiLoserTeam) {
                            $playerIds = array_filter([$semiLoserTeam->player1_id, $semiLoserTeam->player2_id]);
                            \App\Models\EventRegistration::where('event_id', $event->id)
                                ->whereIn('user_id', $playerIds)
                                ->update(['placement' => 3]);
                        }
                    }
                }
            }
        }
    }

    /**
     * Get visual bracket tree formatted for mobile canvas rendering.
     */
    public function getBracketTree(TournamentCategory $category)
    {
        $matches = TournamentMatch::where('tournament_category_id', $category->id)
            ->with(['team1', 'team2', 'winner', 'court'])
            ->orderBy('round', 'desc')
            ->orderBy('match_number', 'asc')
            ->get();

        $groupedByRound = $matches->groupBy('round');

        $resultRounds = [];
        foreach ($groupedByRound as $round => $roundMatches) {
            $roundName = match ((int)$round) {
                2 => 'Final',
                4 => 'Semi-Finals',
                8 => 'Quarter-Finals',
                16 => 'Round of 16',
                32 => 'Round of 32',
                default => "Round of {$round}"
            };

            $resultRounds[] = [
                'round' => (int)$round,
                'name' => $roundName,
                'matches' => $roundMatches->values(),
            ];
        }

        return $resultRounds;
    }

    /**
     * Update PlayerProfile statistics (matches_played, matches_won, points) for all players in a match.
     */
    public function updateMatchPlayerStats(TournamentMatch $match, $winnerId)
    {
        $team1 = TournamentTeam::find($match->team1_id);
        $team2 = TournamentTeam::find($match->team2_id);
        $winnerTeam = TournamentTeam::find($winnerId);

        $team1PlayerIds = array_filter([$team1?->player1_id, $team1?->player2_id]);
        $team2PlayerIds = array_filter([$team2?->player1_id, $team2?->player2_id]);
        $winnerPlayerIds = array_filter([$winnerTeam?->player1_id, $winnerTeam?->player2_id]);

        $allPlayerIds = array_unique(array_merge($team1PlayerIds, $team2PlayerIds));

        foreach ($allPlayerIds as $userId) {
            $profile = \App\Models\PlayerProfile::firstOrCreate(['user_id' => $userId], [
                'rank_level' => 'D',
                'points' => 0,
                'matches_played' => 0,
                'matches_won' => 0,
            ]);

            $isWinner = in_array($userId, $winnerPlayerIds);

            $profile->increment('matches_played');
            if ($isWinner) {
                $profile->increment('matches_won');
                $profile->increment('points', 50);
            }

            $profile->refresh();
            $profile->update(['rank_level' => \App\Services\RankService::getLevelLabel($profile->points)]);
        }
    }
}
