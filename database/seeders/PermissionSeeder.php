<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | RESET CACHE
        |--------------------------------------------------------------------------
        */

        app()[\Spatie\Permission\PermissionRegistrar::class]
            ->forgetCachedPermissions();

        /*
        |--------------------------------------------------------------------------
        | PERMISSIONS
        |--------------------------------------------------------------------------
        */

        $permissions = [

            /*
            |--------------------------------------------------------------------------
            | DASHBOARD
            |--------------------------------------------------------------------------
            */

            'dashboard.view',

            /*
            |--------------------------------------------------------------------------
            | USERS
            |--------------------------------------------------------------------------
            */

            'users.view',
            'users.create',
            'users.edit',
            'users.delete',

            /*
            |--------------------------------------------------------------------------
            | BOOKINGS
            |--------------------------------------------------------------------------
            */

            'bookings.view',
            'bookings.create',
            'bookings.edit',
            'bookings.delete',
            'bookings.approve',

            /*
            |--------------------------------------------------------------------------
            | COURTS
            |--------------------------------------------------------------------------
            */

            'courts.view',
            'courts.create',
            'courts.edit',
            'courts.delete',

            /*
            |--------------------------------------------------------------------------
            | EVENTS
            |--------------------------------------------------------------------------
            */

            'events.view',
            'events.create',
            'events.edit',
            'events.delete',
            'events.register',

            /*
            |--------------------------------------------------------------------------
            | PLAYERS
            |--------------------------------------------------------------------------
            */

            'players.view',
            'players.create',
            'players.edit',
            'players.delete',

            /*
            |--------------------------------------------------------------------------
            | COACHES
            |--------------------------------------------------------------------------
            */

            'coaches.view',
            'coaches.create',
            'coaches.edit',
            'coaches.delete',

            /*
            |--------------------------------------------------------------------------
            | STAFF
            |--------------------------------------------------------------------------
            */

            'staff.view',
            'staff.create',
            'staff.edit',
            'staff.delete',

            /*
            |--------------------------------------------------------------------------
            | FINANCE
            |--------------------------------------------------------------------------
            */

            'finance.view',
            'finance.edit',

            /*
            |--------------------------------------------------------------------------
            | WALLET
            |--------------------------------------------------------------------------
            */

            'wallet.view',
            'wallet.edit',

            /*
            |--------------------------------------------------------------------------
            | REPORTS
            |--------------------------------------------------------------------------
            */

            'reports.view',
        ];

        /*
        |--------------------------------------------------------------------------
        | CREATE PERMISSIONS
        |--------------------------------------------------------------------------
        */

        foreach ($permissions as $permission) {

            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | ADMIN
        |--------------------------------------------------------------------------
        */

        $admin = Role::firstOrCreate([
            'name' => 'Admin',
            'guard_name' => 'web',
        ]);

        $admin->syncPermissions(Permission::all());

        /*
        |--------------------------------------------------------------------------
        | MANAGER
        |--------------------------------------------------------------------------
        */

        $manager = Role::firstOrCreate([
            'name' => 'Manager',
            'guard_name' => 'web',
        ]);

        $manager->syncPermissions([

            'dashboard.view',

            // BOOKINGS
            'bookings.view',
            'bookings.create',
            'bookings.edit',
            'bookings.delete',
            'bookings.approve',

            // COURTS
            'courts.view',
            'courts.create',
            'courts.edit',
            'courts.delete',

            // EVENTS
            'events.view',
            'events.create',
            'events.edit',
            'events.delete',

            // PLAYERS
            'players.view',
            'players.create',
            'players.edit',
            'players.delete',

            // COACHES
            'coaches.view',
            'coaches.create',
            'coaches.edit',
            'coaches.delete',

            // WALLET
            'wallet.view',

            // REPORTS
            'reports.view',
        ]);

        /*
        |--------------------------------------------------------------------------
        | RECEPTIONIST
        |--------------------------------------------------------------------------
        */

        $receptionist = Role::firstOrCreate([
            'name' => 'Receptionist',
            'guard_name' => 'web',
        ]);

        $receptionist->syncPermissions([

            'dashboard.view',

            // BOOKINGS
            'bookings.view',
            'bookings.create',
            'bookings.edit',
            'bookings.delete',
            'bookings.approve',

            // PLAYERS
            'players.view',
            'players.create',
            'players.edit',
            'players.delete',

            // VIEW ONLY
            'courts.view',
            'events.view',
            'coaches.view',

            // WALLET
            'wallet.view',
        ]);

        /*
        |--------------------------------------------------------------------------
        | COACH
        |--------------------------------------------------------------------------
        */

        $coach = Role::firstOrCreate([
            'name' => 'Coach',
            'guard_name' => 'web',
        ]);

        $coach->syncPermissions([

            'dashboard.view',

            'bookings.view',

            'events.view',

            'players.view',
        ]);

        /*
        |--------------------------------------------------------------------------
        | PLAYER
        |--------------------------------------------------------------------------
        */

        $player = Role::firstOrCreate([
            'name' => 'Player',
            'guard_name' => 'web',
        ]);

        $player->syncPermissions([

            'dashboard.view',

            'bookings.view',
            'bookings.create',

            'events.view',
            'events.register',

            'wallet.view',
        ]);

        /*
        |--------------------------------------------------------------------------
        | STAFF
        |--------------------------------------------------------------------------
        */

        $staff = Role::firstOrCreate([
            'name' => 'Staff',
            'guard_name' => 'web',
        ]);

        $staff->syncPermissions([

            'dashboard.view',

            'bookings.view',

            'events.view',
        ]);

        /*
        |--------------------------------------------------------------------------
        | RESET CACHE AGAIN
        |--------------------------------------------------------------------------
        */

        app()[\Spatie\Permission\PermissionRegistrar::class]
            ->forgetCachedPermissions();
    }
}