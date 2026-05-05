<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define permissions
        $permissions = [
            'manage-users',
            'manage-courts',
            'manage-bookings',
            'manage-wallets',
            'view-reports',
            'book-courts',
            'view-bookings',
        ];

        foreach ($permissions as $permission) {
            \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles and assign created permissions
        $adminRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Admin']);
        $adminRole->syncPermissions($permissions);

        $managerRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Manager']);
        $managerRole->syncPermissions(['manage-users', 'manage-courts', 'manage-bookings', 'view-reports']);

        $coachRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Coach']);
        $coachRole->syncPermissions(['book-courts']);

        $playerRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Player']);
        $playerRole->syncPermissions(['book-courts']);

        $receptionistRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Receptionist']);
        $receptionistRole->syncPermissions(['manage-bookings', 'manage-wallets']);

        $staffRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Staff']);
        $staffRole->syncPermissions(['view-bookings']);

        // Assign Admin role to the default system admin user
        $adminUser = \App\Models\User::where('email', 'admin@acepadel.com')->first();
        if ($adminUser) {
            $adminUser->assignRole($adminRole);
        }
    }
}
