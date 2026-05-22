<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StaffProfile;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Storage;
use App\Services\ImageUploadService;

class StaffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $staff = User::role(['Receptionist', 'Staff'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->with(['staffProfile', 'wallet', 'roles', 'playerProfile'])
            ->paginate(12)
            ->withQueryString();

        $eligiblePlayers = User::whereHas('playerProfile')
            ->whereDoesntHave('roles', function($q) {
                $q->whereIn('name', ['Receptionist', 'Staff', 'Manager', 'Coach']);
            })->select('id', 'name', 'email', 'phone')->orderBy('name')->get();

        return Inertia::render('Admin/Staff/Index', [
            'staff' => $staff,
            'eligiblePlayers' => $eligiblePlayers,
            'filters' => ['search' => $search]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id'        => 'required|exists:users,id',
            'role'           => 'required|in:Receptionist,Staff,Manager,Coach',
            'position'       => 'nullable|string|max:255',
            'shift_name'     => 'nullable|string|max:255',
            'working_days'   => 'nullable|array',
        ], [
            'user_id.required'         => 'يرجى اختيار اللاعب المراد ترقيته.',
            'user_id.exists'           => 'اللاعب المحدد غير موجود.',
            'role.required'            => 'الدور مطلوب.',
            'role.in'                  => 'الدور غير صالح.',
            'working_days.array'       => 'أيام العمل يجب أن تكون مصفوفة.',
        ]);

        $user = User::findOrFail($request->user_id);

        if ($user->hasAnyRole(['Receptionist', 'Staff', 'Manager', 'Coach'])) {
            return redirect()->back()->withErrors(['user_id' => 'هذا اللاعب هو موظف بالفعل.']);
        }

        // Assign Role
        $user->assignRole($request->role);

        // Create staff profile
        StaffProfile::create([
            'user_id' => $user->id,
            'position' => $request->position,
            'shift_name' => $request->shift_name,
            'working_days' => $request->working_days ?: [],
        ]);

        return redirect()->back()->with('success', 'تم تعيين اللاعب كموظف بنجاح');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => 'nullable|required_without:phone|string|email|max:255|unique:users,email,'.$user->id,
            'phone'          => 'nullable|required_without:email|string|max:255|unique:users,phone,'.$user->id,
            'password'       => ['nullable', Rules\Password::defaults()],
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,avif|max:2048',
            'role'           => 'required|in:Receptionist,Staff,Manager,Coach',
            'position'       => 'nullable|string|max:255',
            'shift_name'     => 'nullable|string|max:255',
            'working_days'   => 'nullable|array',
            'wallet_balance' => 'nullable|numeric|min:0',
        ], [
            'name.required'            => 'الاسم الكامل مطلوب.',
            'email.required_without'   => 'البريد الإلكتروني مطلوب في حال عدم إدخال رقم الجوال.',
            'email.unique'             => 'هذا البريد الإلكتروني مستخدم مسبقاً.',
            'phone.required_without'   => 'رقم الجوال مطلوب في حال عدم إدخال البريد الإلكتروني.',
            'phone.unique'             => 'رقم الجوال مستخدم مسبقاً.',
            'role.required'            => 'الدور مطلوب.',
            'wallet_balance.numeric'   => 'رصيد المحفظة يجب أن يكون رقماً.',
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        if ($request->hasFile('image')) {

            $data['image_path'] = ImageUploadService::upload(
                $request->file('image'),
                'profiles',
                $user->image_path
            );
        }

        $user->update($data);

        // Update Role
        $user->syncRoles([$request->role]);

        // Update or create staff profile
        StaffProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'position' => $request->position,
                'shift_name' => $request->shift_name,
                'working_days' => $request->working_days ?: [],
            ]
        );

        // Update or create wallet
        if ($request->has('wallet_balance') && $request->wallet_balance !== null) {
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $user->id],
                ['balance' => 0]
            );

            $oldBalance = (float) $wallet->balance;
            $newBalance = (float) $request->wallet_balance;

            if ($newBalance !== $oldBalance) {
                $walletService = app(\App\Services\WalletService::class);
                if ($newBalance > $oldBalance) {
                    $diff = $newBalance - $oldBalance;
                    $walletService->deposit($wallet, $diff, 'شحن رصيد من قبل الإدارة', auth()->id());
                } else {
                    $diff = $oldBalance - $newBalance;
                    $walletService->manualAdjustment($wallet, $diff, 'تعديل رصيد يدوي (خصم) من قبل الإدارة', auth()->id());
                }
            }
        }

        return redirect()->back()->with('success', 'تم تحديث بيانات الموظف بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        
        // Remove staff roles
        $user->removeRole('Receptionist');
        $user->removeRole('Staff');
        $user->removeRole('Manager');
        $user->removeRole('Coach');

        // Ensure they still have Player role
        if (!$user->hasRole('Player')) {
            $user->assignRole('Player');
        }

        // Delete staff profile
        if ($user->staffProfile) {
            $user->staffProfile->delete();
        }

        return redirect()->back()->with('success', 'تم إزالة صلاحيات الموظف بنجاح (عاد كلاعب)');
    }
}
