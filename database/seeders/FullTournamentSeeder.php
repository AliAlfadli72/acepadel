<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\PlayerProfile;
use App\Models\Tournament;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\TournamentTeam;
use App\Models\User;
use App\Models\Wallet;
use App\Services\TournamentBracketService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class FullTournamentSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        TournamentMatch::truncate();
        TournamentTeam::truncate();
        TournamentCategory::truncate();
        Tournament::truncate();
        EventRegistration::truncate();
        Event::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. Create Real Demo Players (Arabic & English)
        $playersData = [
            ['name' => 'طارق النابلسي', 'email' => 'tarek.nabulsi@acepadel.com', 'phone' => '+963944111222'],
            ['name' => 'أحمد الحلاق', 'email' => 'ahmad.hallak@acepadel.com', 'phone' => '+963944222333'],
            ['name' => 'رامي الشامي', 'email' => 'rami.shami@acepadel.com', 'phone' => '+963944333444'],
            ['name' => 'طارق الشامي', 'email' => 'tarek.shami@acepadel.com', 'phone' => '+963944444555'],
            ['name' => 'كرم شعبان', 'email' => 'karam.shaban@acepadel.com', 'phone' => '+963944555666'],
            ['name' => 'زياد العطار', 'email' => 'ziad.attar@acepadel.com', 'phone' => '+963944666777'],
            ['name' => 'عمر الكردي', 'email' => 'omar.kurdi@acepadel.com', 'phone' => '+963944777888'],
            ['name' => 'سامر الخطيب', 'email' => 'samer.khatib@acepadel.com', 'phone' => '+963944888999'],

            ['name' => 'إياد القاسم', 'email' => 'eyad.kassim@acepadel.com', 'phone' => '+963955111222'],
            ['name' => 'باسل العلي', 'email' => 'basel.ali@acepadel.com', 'phone' => '+963955222333'],
            ['name' => 'مازن خوري', 'email' => 'mazen.khoury@acepadel.com', 'phone' => '+963955333444'],
            ['name' => 'بشر الحكيم', 'email' => 'bisher.hakim@acepadel.com', 'phone' => '+963955444555'],
            ['name' => 'فادي السعيد', 'email' => 'fadi.saeed@acepadel.com', 'phone' => '+963955555666'],
            ['name' => 'لؤي مراد', 'email' => 'louay.murad@acepadel.com', 'phone' => '+963955666777'],
            ['name' => 'ياسر النجار', 'email' => 'yasser.najjar@acepadel.com', 'phone' => '+963955777888'],
            ['name' => 'حازم الجابي', 'email' => 'hazem.jabi@acepadel.com', 'phone' => '+963955888999'],
        ];

        $users = [];
        foreach ($playersData as $data) {
            $user = User::where('email', $data['email'])
                ->orWhere('phone', $data['phone'])
                ->first();

            if (!$user) {
                $user = User::create([
                    'email' => $data['email'],
                    'name' => $data['name'],
                    'phone' => $data['phone'],
                    'password' => Hash::make('password'),
                ]);
            } else {
                $user->update([
                    'name' => $data['name'],
                    'phone' => $data['phone'],
                ]);
            }

            if (!$user->hasRole('Player')) {
                $user->assignRole('Player');
            }

            PlayerProfile::firstOrCreate(['user_id' => $user->id], [
                'rank_level' => 'Intermediate',
                'points' => rand(100, 500),
                'matches_played' => rand(5, 20),
                'matches_won' => rand(3, 15),
            ]);

            Wallet::firstOrCreate(['user_id' => $user->id], [
                'balance' => 50000,
            ]);

            $users[] = $user;
        }

        $bracketService = new TournamentBracketService();

        // ─────────────────────────────────────────────────────────────────────
        // TOURNAMENT & EVENT 1: بطولة دمشق الكبرى للبادل 🏆 (Completed)
        // ─────────────────────────────────────────────────────────────────────
        $t1 = Tournament::create([
            'title_ar' => 'بطولة دمشق الكبرى للبادل 🏆',
            'title_en' => 'Damascus Grand Padel Championship 🏆',
            'desc_ar' => 'أقوى بطولة بادل في سوريا بمشاركة أبطال اللعبة، ومجموع جوائز يصل إلى 40,000,000 ليرة سورية مع تغطية إعلامية وتصفيات حماسية.',
            'desc_en' => 'The premier Padel tournament in Syria with top players and 40 Million SYP prize pool with full media coverage.',
            'location_ar' => 'نادي آيس بادل - أوتوستراد المزة - نادي الوحدة الرياضي',
            'location_en' => 'Ace Padel Club - Mezzeh Highway - Al-Wahda Sports Club',
            'prize_pool' => '40 Million SYP',
            'start_date' => '2026-07-25',
            'end_date' => '2026-07-28',
            'status' => 'completed',
        ]);

        $e1 = Event::create([
            'title_ar' => 'بطولة دمشق الكبرى للبادل 🏆',
            'title_en' => 'Damascus Grand Padel Championship 🏆',
            'desc_ar' => 'أقوى بطولة بادل في سوريا بمشاركة أبطال اللعبة، ومجموع جوائز يصل إلى 40,000,000 ليرة سورية مع تغطية إعلامية وتصفيات حماسية.',
            'desc_en' => 'The premier Padel tournament in Syria with top players and 40 Million SYP prize pool with full media coverage.',
            'category' => 'tournament',
            'level' => 'Category A (المحترفين)',
            'date' => '2026-07-28',
            'time' => '18:00:00',
            'fee' => 150000.00,
            'payment_required' => 1,
            'prize_ar' => '40 مليون ليرة سورية',
            'prize_en' => '40 Million SYP',
            'max_participants' => 16,
            'status' => 'completed',
        ]);

        // Category A for Tournament 1
        $cat1 = TournamentCategory::create([
            'tournament_id' => $t1->id,
            'name' => 'Category A (المحترفين)',
            'max_teams' => 4,
            'fee' => 150000.00,
            'format' => 'knockout',
        ]);

        // Create 4 Pairs (8 players: users[0..7])
        $team1 = TournamentTeam::create([
            'tournament_category_id' => $cat1->id,
            'team_name' => 'ثنائي الأبطال (' . $users[0]->name . ' + ' . $users[1]->name . ')',
            'player1_id' => $users[0]->id,
            'player2_id' => $users[1]->id,
            'player2_name' => $users[1]->name,
            'status' => 'confirmed',
        ]);

        $team2 = TournamentTeam::create([
            'tournament_category_id' => $cat1->id,
            'team_name' => 'صقور البادل (' . $users[2]->name . ' + ' . $users[3]->name . ')',
            'player1_id' => $users[2]->id,
            'player2_id' => $users[3]->id,
            'player2_name' => $users[3]->name,
            'status' => 'confirmed',
        ]);

        $team3 = TournamentTeam::create([
            'tournament_category_id' => $cat1->id,
            'team_name' => 'فريق المزة (' . $users[4]->name . ' + ' . $users[5]->name . ')',
            'player1_id' => $users[4]->id,
            'player2_id' => $users[5]->id,
            'player2_name' => $users[5]->name,
            'status' => 'confirmed',
        ]);

        $team4 = TournamentTeam::create([
            'tournament_category_id' => $cat1->id,
            'team_name' => 'نجوم دمشق (' . $users[6]->name . ' + ' . $users[7]->name . ')',
            'player1_id' => $users[6]->id,
            'player2_id' => $users[7]->id,
            'player2_name' => $users[7]->name,
            'status' => 'confirmed',
        ]);

        // Event Registrations for all 8 players in Event 1
        for ($i = 0; $i < 8; $i++) {
            EventRegistration::create([
                'event_id' => $e1->id,
                'user_id' => $users[$i]->id,
                'status' => 'approved',
            ]);
        }

        // Generate Bracket for Cat 1
        $bracketService->generateBracket($cat1);

        // Explicitly set team slots for deterministic demo results:
        $semi1 = TournamentMatch::where('tournament_category_id', $cat1->id)->where('round', 4)->where('match_number', 1)->first();
        $semi2 = TournamentMatch::where('tournament_category_id', $cat1->id)->where('round', 4)->where('match_number', 2)->first();
        $final = TournamentMatch::where('tournament_category_id', $cat1->id)->where('round', 2)->where('match_number', 1)->first();

        if ($semi1 && $semi2 && $final) {
            $semi1->update(['team1_id' => $team1->id, 'team2_id' => $team4->id]);
            $semi2->update(['team1_id' => $team2->id, 'team2_id' => $team3->id]);

            // Semi 1: Team 1 (ثنائي الأبطال: طارق النابلسي + أحمد الحلاق) wins (6 - 4)
            $bracketService->recordMatchResult($semi1, $team1->id, '6-4', '4-6');
            // Semi 2: Team 2 (صقور البادل: رامي الشامي + طارق الشامي) wins (6 - 3)
            $bracketService->recordMatchResult($semi2, $team2->id, '6-3', '3-6');

            // Final Match: Team 1 vs Team 2 -> Team 1 wins (7 - 5)
            $final->update(['team1_id' => $team1->id, 'team2_id' => $team2->id]);
            $bracketService->recordMatchResult($final, $team1->id, '7-5', '5-7');
        }

        // ─────────────────────────────────────────────────────────────────────
        // TOURNAMENT & EVENT 2: كأس آيس الصيفي 2026 ☀️ (Ongoing)
        // ─────────────────────────────────────────────────────────────────────
        $t2 = Tournament::create([
            'title_ar' => 'كأس آيس الصيفي 2026 ☀️',
            'title_en' => 'Ace Summer Cup 2026 ☀️',
            'desc_ar' => 'بطولة صيفية تنافسية للفئات المتقدمة والمحترفة بمجموع جوائز 15,000,000 ليرة سورية.',
            'desc_en' => 'Competitive summer tournament for advanced players with 15 Million SYP prize pool.',
            'location_ar' => 'نادي آيس بادل - ملاعب المزة المكشوفة',
            'location_en' => 'Ace Padel Club - Outdoor Courts',
            'prize_pool' => '15 Million SYP',
            'start_date' => '2026-08-01',
            'end_date' => '2026-08-10',
            'status' => 'ongoing',
        ]);

        $e2 = Event::create([
            'title_ar' => 'كأس آيس الصيفي 2026 ☀️',
            'title_en' => 'Ace Summer Cup 2026 ☀️',
            'desc_ar' => 'بطولة صيفية تنافسية للفئات المتقدمة والمحترفة بمجموع جوائز 15,000,000 ليرة سورية.',
            'desc_en' => 'Competitive summer tournament for advanced players with 15 Million SYP prize pool.',
            'category' => 'tournament',
            'level' => 'Category B (المتقدمين)',
            'date' => '2026-08-05',
            'time' => '17:00:00',
            'fee' => 100000.00,
            'payment_required' => 1,
            'prize_ar' => '15 مليون ليرة سورية',
            'prize_en' => '15 Million SYP',
            'max_participants' => 16,
            'status' => 'ongoing',
        ]);

        $cat2 = TournamentCategory::create([
            'tournament_id' => $t2->id,
            'name' => 'Category B (المتقدمين)',
            'max_teams' => 4,
            'fee' => 100000.00,
            'format' => 'knockout',
        ]);

        // Create 4 Pairs for Event 2 (users[8..15])
        for ($i = 8; $i < 16; $i += 2) {
            TournamentTeam::create([
                'tournament_category_id' => $cat2->id,
                'team_name' => $users[$i]->name . ' + ' . $users[$i + 1]->name,
                'player1_id' => $users[$i]->id,
                'player2_id' => $users[$i + 1]->id,
                'player2_name' => $users[$i + 1]->name,
                'status' => 'confirmed',
            ]);

            EventRegistration::create([
                'event_id' => $e2->id,
                'user_id' => $users[$i]->id,
                'status' => 'approved',
            ]);

            EventRegistration::create([
                'event_id' => $e2->id,
                'user_id' => $users[$i + 1]->id,
                'status' => 'approved',
            ]);
        }

        $bracketService->generateBracket($cat2);

        // Record 1 Semi Final match result in ongoing tournament
        $semi2 = TournamentMatch::where('tournament_category_id', $cat2->id)
            ->where('round', 4)->first();
        if ($semi2) {
            $bracketService->recordMatchResult($semi2, $semi2->team1_id, '6-2', '2-6');
        }

        // ─────────────────────────────────────────────────────────────────────
        // TOURNAMENT & EVENT 3: فعالية التحدي والتأهيل للمبتدئين 🎾 (Upcoming)
        // ─────────────────────────────────────────────────────────────────────
        $t3 = Tournament::create([
            'title_ar' => 'فعالية التحدي والتأهيل للمبتدئين 🎾',
            'title_en' => 'Beginner Challenge & Training Event 🎾',
            'desc_ar' => 'بطولة تدريبية ممتعة للمبتدئين تتضمن تعلم أساسيات التكتيك وتجربة مباريات حقيقية مع مدربي النادي.',
            'desc_en' => 'Fun training event for beginners learning tactics with pro coaches.',
            'location_ar' => 'نادي آيس بادل - الملاعب المغلقة',
            'location_en' => 'Ace Padel Club - Indoor Courts',
            'prize_pool' => 'كؤوس وميداليات وساعات تدريب',
            'start_date' => '2026-08-25',
            'end_date' => '2026-08-28',
            'status' => 'upcoming',
        ]);

        $e3 = Event::create([
            'title_ar' => 'فعالية التحدي والتأهيل للمبتدئين 🎾',
            'title_en' => 'Beginner Challenge & Training Event 🎾',
            'desc_ar' => 'بطولة تدريبية ممتعة للمبتدئين تتضمن تعلم أساسيات التكتيك وتجربة مباريات حقيقية مع مدربي النادي.',
            'desc_en' => 'Fun training event for beginners learning tactics with pro coaches.',
            'category' => 'tournament',
            'level' => 'Category C (المبتدئين)',
            'date' => '2026-08-28',
            'time' => '16:00:00',
            'fee' => 50000.00,
            'payment_required' => 0,
            'prize_ar' => 'كؤوس وميداليات وساعات تدريب',
            'prize_en' => 'Trophies & Medals',
            'max_participants' => 16,
            'status' => 'upcoming',
        ]);

        $cat3 = TournamentCategory::create([
            'tournament_id' => $t3->id,
            'name' => 'Category C (المبتدئين)',
            'max_teams' => 8,
            'fee' => 50000.00,
            'format' => 'knockout',
        ]);

        // Register 4 users for upcoming event
        for ($i = 0; $i < 4; $i++) {
            EventRegistration::create([
                'event_id' => $e3->id,
                'user_id' => $users[$i]->id,
                'status' => 'approved',
            ]);
        }
    }
}
