<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\PlayerProfile;
use App\Models\Wallet;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
        ]);

        // ADMIN
        $admin = User::create([
            'name' => 'System Admin',
            'email' => 'admin@acepadel.com',
            'phone' => '+963000000000',
            'password' => bcrypt('password'),
        ]);

        $admin->assignRole('Admin');

        // Player Profile
        PlayerProfile::create([
            'user_id' => $admin->id,
            'rank_level' => 'Beginner',
                'points' => 0,
                'matches_played' => 0,
                'matches_won' => 0,
        ]);

        // Wallet
        Wallet::create([
            'user_id' => $admin->id,
            'balance' => 0,
        ]);
        // OTHER USERS
        // $users = [
        //     ['name' => 'Test Manager', 'email' => 'manager@acepadel.com', 'role' => 'Manager'],
        //     ['name' => 'Test Coach', 'email' => 'coach@acepadel.com', 'role' => 'Coach'],
        //     ['name' => 'Test Player', 'email' => 'player@acepadel.com', 'role' => 'Player'],
        //     ['name' => 'Test Receptionist', 'email' => 'receptionist@acepadel.com', 'role' => 'Receptionist'],
        //     ['name' => 'Test Staff', 'email' => 'staff@acepadel.com', 'role' => 'Staff'],
        // ];

        // foreach ($users as $userData) {

        //     $user = User::create([
        //         'name' => $userData['name'],
        //         'email' => $userData['email'],
        //         'phone' => '+963' . rand(100000000, 999999999),
        //         'password' => bcrypt('password'),
        //     ]);

        //     $user->assignRole($userData['role']);
        //     // Player Profile
        //     PlayerProfile::create([
        //         'user_id' => $user->id,
        //         'rank_level' => 'Beginner',
        //         'points' => 0,
        //         'matches_played' => 0,
        //         'matches_won' => 0,
        //     ]);
        //                 // Wallet
        //     Wallet::create([
        //         'user_id' => $user->id,
        //         'balance' => 0,
        //     ]);
        // }
    }
}
