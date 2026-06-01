<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define Pilates-specific permissions
        $permissions = [
            'pilates.view',
            'pilates.create',
            'pilates.edit',
            'pilates.delete',
            'pilates.bookings.view',
            'pilates.bookings.approve',
            'pilates.finance.view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web'
            ]);
        }

        // 1. Create Pilates Admin Role
        $pilatesAdmin = Role::firstOrCreate([
            'name' => 'Pilates Admin',
            'guard_name' => 'web'
        ]);

        // Assign full pilates access to Pilates Admin
        $pilatesAdmin->syncPermissions(array_merge([
            'dashboard.view',
            'players.view',
            'players.create',
            'players.edit',
            'players.delete',
        ], $permissions));

        // 2. Create Pilates Coach Role
        $pilatesCoach = Role::firstOrCreate([
            'name' => 'Pilates Coach',
            'guard_name' => 'web'
        ]);

        // Assign restricted access to Pilates Coach
        $pilatesCoach->syncPermissions([
            'dashboard.view',
            'pilates.view',
            'pilates.bookings.view',
        ]);

        // Also give the core Admin role all the new permissions
        $admin = Role::where('name', 'Admin')->first();
        if ($admin) {
            $admin->givePermissionTo($permissions);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove roles and permissions if rolling back
        Role::whereIn('name', ['Pilates Admin', 'Pilates Coach'])->delete();
        Permission::whereIn('name', [
            'pilates.view',
            'pilates.create',
            'pilates.edit',
            'pilates.delete',
            'pilates.bookings.view',
            'pilates.bookings.approve',
            'pilates.finance.view',
        ])->delete();

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }
};
