<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tournament;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\TournamentTeam;
use App\Models\User;
use App\Services\TournamentBracketService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TournamentController extends Controller
{
    /**
     * GET /api/v1/tournaments
     * List all tournaments with categories & registration status.
     */
    public function index(Request $request)
    {
        $tournaments = Tournament::with(['categories.teams'])
            ->whereIn('status', ['upcoming', 'ongoing', 'completed'])
            ->orderBy('start_date', 'desc')
            ->get();

        $data = $tournaments->map(function ($t) {
            return [
                'id' => $t->id,
                'title' => $t->title,
                'title_ar' => $t->title_ar,
                'title_en' => $t->title_en,
                'desc' => $t->desc,
                'location' => $t->location,
                'prize_pool' => $t->prize_pool,
                'start_date' => $t->start_date ? $t->start_date->format('Y-m-d') : null,
                'end_date' => $t->end_date ? $t->end_date->format('Y-m-d') : null,
                'banner_image' => $t->banner_image ? asset('storage/' . $t->banner_image) : null,
                'status' => $t->status,
                'categories' => $t->categories->map(function ($c) {
                    return [
                        'id' => $c->id,
                        'name' => $c->name,
                        'max_teams' => $c->max_teams,
                        'teams_count' => $c->teams->count(),
                        'fee' => $c->fee,
                        'format' => $c->format,
                    ];
                }),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * GET /api/v1/tournaments/{id}
     * Get details of a single tournament.
     */
    public function show($id)
    {
        $tournament = Tournament::with(['categories.teams.player1', 'categories.teams.player2'])->find($id);

        if (!$tournament) {
            return response()->json([
                'status' => 'error',
                'message' => 'البطولة غير موجودة.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $tournament->id,
                'title' => $tournament->title,
                'title_ar' => $tournament->title_ar,
                'title_en' => $tournament->title_en,
                'desc' => $tournament->desc,
                'location' => $tournament->location,
                'prize_pool' => $tournament->prize_pool,
                'start_date' => $tournament->start_date ? $tournament->start_date->format('Y-m-d') : null,
                'end_date' => $tournament->end_date ? $tournament->end_date->format('Y-m-d') : null,
                'banner_image' => $tournament->banner_image ? asset('storage/' . $tournament->banner_image) : null,
                'status' => $tournament->status,
                'categories' => $tournament->categories,
            ],
        ]);
    }

    /**
     * GET /api/v1/tournaments/{id}/categories/{categoryId}/bracket
     * Fetch complete visual bracket tree payload.
     */
    public function getBracket($id, $categoryId, TournamentBracketService $bracketService)
    {
        $category = TournamentCategory::where('tournament_id', $id)->where('id', $categoryId)->first();

        if (!$category) {
            return response()->json([
                'status' => 'error',
                'message' => 'فئة البطولة غير موجودة.',
            ], 404);
        }

        $bracketRounds = $bracketService->getBracketTree($category);

        return response()->json([
            'status' => 'success',
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'format' => $category->format,
            ],
            'rounds' => $bracketRounds,
        ]);
    }

    /**
     * GET /api/v1/tournaments/{id}/categories/{categoryId}/matches
     * Fetch match schedule sorted by date and time.
     */
    public function getMatches($id, $categoryId)
    {
        $matches = TournamentMatch::where('tournament_category_id', $categoryId)
            ->with(['team1', 'team2', 'winner', 'court'])
            ->orderBy('scheduled_date', 'asc')
            ->orderBy('scheduled_time', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $matches,
        ]);
    }

    /**
     * GET /api/v1/my-tournament-matches
     * Fetch matches for the authenticated player.
     */
    public function myMatches(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'status' => 'success',
                    'data'   => [],
                ]);
            }

            // Find teams where user is player1 or player2
            $myTeamIds = TournamentTeam::where('player1_id', $user->id)
                ->orWhere('player2_id', $user->id)
                ->pluck('id');

            if ($myTeamIds->isEmpty()) {
                return response()->json([
                    'status' => 'success',
                    'data'   => [],
                ]);
            }

            $matches = TournamentMatch::where(function ($q) use ($myTeamIds) {
                    $q->whereIn('team1_id', $myTeamIds)->orWhereIn('team2_id', $myTeamIds);
                })
                ->with(['category.tournament', 'team1', 'team2', 'winner', 'court'])
                ->orderBy('scheduled_date', 'asc')
                ->orderBy('scheduled_time', 'asc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data'   => $matches,
            ]);
        } catch (\Exception $e) {
            \Log::error('myMatches Exception: ' . $e->getMessage() . ' at ' . $e->getFile() . ':' . $e->getLine());
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/v1/tournaments/{id}/register
     * Register a team for a category.
     */
    public function registerTeam(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'يرجى تسجيل الدخول للتسجيل في البطولة.',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:tournament_categories,id',
            'team_name' => 'nullable|string|max:100',
            'player2_id' => 'nullable|exists:users,id',
            'player2_name' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $category = TournamentCategory::where('tournament_id', $id)->find($request->category_id);
        if (!$category) {
            return response()->json([
                'status' => 'error',
                'message' => 'الفئة غير مجدية في هذه البطولة.',
            ], 404);
        }

        // Check if category reached capacity
        $currentCount = $category->teams()->where('status', 'confirmed')->count();
        if ($currentCount >= $category->max_teams) {
            return response()->json([
                'status' => 'error',
                'message' => 'اكتملت السعة القصوى لهذه الفئة.',
            ], 400);
        }

        // Check if player is already registered in this category
        $existing = TournamentTeam::where('tournament_category_id', $category->id)
            ->where(function ($q) use ($user) {
                $q->where('player1_id', $user->id)->orWhere('player2_id', $user->id);
            })->first();

        if ($existing) {
            return response()->json([
                'status' => 'error',
                'message' => 'أنت مسجل بالفعل في هذه الفئة.',
            ], 400);
        }

        $team = TournamentTeam::create([
            'tournament_category_id' => $category->id,
            'team_name' => $request->team_name,
            'player1_id' => $user->id,
            'player2_id' => $request->player2_id,
            'player2_name' => $request->player2_name,
            'status' => 'confirmed',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'تم التسجيل في البطولة بنجاح!',
            'data' => $team->load(['player1', 'player2']),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/v1/admin/tournaments
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title_ar' => 'required|string|max:255',
            'title_en' => 'required|string|max:255',
            'desc_ar' => 'nullable|string',
            'desc_en' => 'nullable|string',
            'location_ar' => 'nullable|string',
            'location_en' => 'nullable|string',
            'prize_pool' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tournament = Tournament::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'تم إنشاء البطولة بنجاح.',
            'data' => $tournament,
        ], 201);
    }

    /**
     * POST /api/v1/admin/tournaments/{id}/categories
     */
    public function storeCategory(Request $request, $id)
    {
        $tournament = Tournament::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'max_teams' => 'required|integer|min:2',
            'fee' => 'nullable|numeric',
            'format' => 'required|in:knockout,group_stage,hybrid',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $category = $tournament->categories()->create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'تمت إضافة الفئة بنجاح.',
            'data' => $category,
        ], 201);
    }

    /**
     * POST /api/v1/admin/tournaments/{id}/categories/{categoryId}/generate-bracket
     */
    public function generateBracket($id, $categoryId, TournamentBracketService $bracketService)
    {
        $category = TournamentCategory::where('tournament_id', $id)->where('id', $categoryId)->firstOrFail();

        try {
            $rounds = $bracketService->generateBracket($category);

            return response()->json([
                'status' => 'success',
                'message' => 'تم إنتاج شجرة التصفيات بنجاح!',
                'rounds' => $rounds,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * PUT /api/v1/admin/matches/{matchId}/score
     */
    public function updateMatchScore(Request $request, $matchId, TournamentBracketService $bracketService)
    {
        $match = TournamentMatch::findOrFail($matchId);

        $validator = Validator::make($request->all(), [
            'winner_id' => 'required|exists:tournament_teams,id',
            'score_team1' => 'required|string',
            'score_team2' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $updatedMatch = $bracketService->recordMatchResult(
                $match,
                $request->winner_id,
                $request->score_team1,
                $request->score_team2
            );

            return response()->json([
                'status' => 'success',
                'message' => 'تم تحديث النتيجة وتأهيل الفائز للشوط التالي بنجاح.',
                'data' => $updatedMatch,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * PUT /api/v1/admin/matches/{matchId}/schedule
     */
    public function updateMatchSchedule(Request $request, $matchId)
    {
        $match = TournamentMatch::findOrFail($matchId);

        $validator = Validator::make($request->all(), [
            'court_id' => 'nullable|exists:courts,id',
            'scheduled_date' => 'nullable|date',
            'scheduled_time' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $match->update($request->only(['court_id', 'scheduled_date', 'scheduled_time']));

        return response()->json([
            'status' => 'success',
            'message' => 'تم تحديث موعد وملعب المباراة بنجاح.',
            'data' => $match->load(['court']),
        ]);
    }
}
