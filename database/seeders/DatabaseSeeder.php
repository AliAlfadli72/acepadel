<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::create([
            'name' => 'System Admin',
            'email' => 'admin@acepadel.com',
            'phone' => '+963000000000',
            'password' => bcrypt('password'),
        ]);

        $this->call([
            RoleSeeder::class,
            CourtsSeeder::class,
        ]);

        $users = [
            ['name' => 'Test Manager', 'email' => 'manager@acepadel.com', 'role' => 'Manager'],
            ['name' => 'Test Coach', 'email' => 'coach@acepadel.com', 'role' => 'Coach'],
            ['name' => 'Test Player', 'email' => 'player@acepadel.com', 'role' => 'Player'],
            ['name' => 'Test Receptionist', 'email' => 'receptionist@acepadel.com', 'role' => 'Receptionist'],
            ['name' => 'Test Staff', 'email' => 'staff@acepadel.com', 'role' => 'Staff'],
        ];

        foreach ($users as $userData) {
            $user = User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'phone' => '+963' . rand(100000000, 999999999),
                'password' => bcrypt('password'),
            ]);
            $user->assignRole($userData['role']);
        }
    }
}
