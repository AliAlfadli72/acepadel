<?php

namespace Database\Seeders;

use App\Models\Tournament;
use App\Models\TournamentCategory;
use App\Models\TournamentTeam;
use App\Models\User;
use App\Services\TournamentBracketService;
use Illuminate\Database\Seeder;

class TournamentSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Main User for Player 1
        $mainUser = User::firstOrCreate(
            ['email' => 'player@acepadel.com'],
            [
                'name' => 'Rami Mazhar',
                'phone' => '+963911111111',
                'password' => bcrypt('password'),
            ]
        );

        // 2. Create Tournament
        $tournament = Tournament::create([
            'title_ar' => 'THE BIG TOURNAMENT',
            'title_en' => 'THE BIG TOURNAMENT',
            'desc_ar' => 'بطولة آيس بادل بمجموع جوائز 40 مليون ليرة سورية، تنافس في فئات Category B & C!',
            'desc_en' => 'Ace Padel Club Big Tournament with 40 Million SYP Prize Pool in Categories B & C.',
            'location_ar' => 'نادي آيس بادل - نادي الوحدة الرياضي',
            'location_en' => 'Ace Padel Club - Al-Wahda Sport Club',
            'prize_pool' => '40 Million SYP',
            'start_date' => '2026-07-28',
            'end_date' => '2026-07-31',
            'status' => 'ongoing',
        ]);

        // 3. Category B
        $catB = TournamentCategory::create([
            'tournament_id' => $tournament->id,
            'name' => 'Category B',
            'max_teams' => 16,
            'fee' => 0.00,
            'format' => 'knockout',
        ]);

        $teamsCatB = [
            'RAMI + MAZHAR',
            'AHMAD + ABD AL GHANI',
            'OMAR + KARAM',
            'SAIF + LOUAY',
            'HAMZE + MAHMOUD',
            'BISHER + ZAID',
            'AMR + SAAED',
            'MICHEAL + OMAR',
            'ABD NAWAF + AHMAD',
            'FAISAL + MAHMOUD',
            'HAZEM + JAD',
            'AGHIAD + WAJED',
            'ALLA + BAGHDAN',
            'SAMI + KENAN',
            'EYAD + BADER',
            'SAMI + AMR',
        ];

        foreach ($teamsCatB as $index => $teamName) {
            TournamentTeam::create([
                'tournament_category_id' => $catB->id,
                'team_name' => $teamName,
                'player1_id' => $mainUser->id,
                'player2_name' => 'Partner ' . ($index + 1),
                'seed' => $index + 1,
                'status' => 'confirmed',
            ]);
        }

        // 4. Category C
        $catC = TournamentCategory::create([
            'tournament_id' => $tournament->id,
            'name' => 'Category C',
            'max_teams' => 16,
            'fee' => 0.00,
            'format' => 'knockout',
        ]);

        $teamsCatC = [
            'HAMZE + AHMAD',
            'FOUAD + MICHEAL',
            'EZO + KAREEM',
            'ISSA + KHALEFA',
            'MAHMOUD + OMAR',
            'SAMI + MOHAMMAD',
            'TAREK + BASHER',
            'MARK + NAJEEB',
            'HESHAM + KHALED',
            'MOEMEN + AMR',
            'KAREEM + SAM',
            'JAMAL + ABDULLAH',
            'ZAID + HANI',
            'AHMAD + IBRAHIM',
            'DANI + SAMER',
            'ANAS + GHAITH',
        ];

        foreach ($teamsCatC as $index => $teamName) {
            TournamentTeam::create([
                'tournament_category_id' => $catC->id,
                'team_name' => $teamName,
                'player1_id' => $mainUser->id,
                'player2_name' => 'Partner ' . ($index + 1),
                'seed' => $index + 1,
                'status' => 'confirmed',
            ]);
        }

        // 5. Generate Brackets automatically
        $bracketService = new TournamentBracketService();
        $bracketService->generateBracket($catB);
        $bracketService->generateBracket($catC);
    }
}
