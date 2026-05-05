<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PlayerProfile;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Storage;

class PlayerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $rank   = $request->input('rank');

        $players = User::role('Player')
            ->when($search, fn($q) => $q->where(fn($q2) =>
                $q2->where('name',  'like', "%{$search}%")
                   ->orWhere('phone', 'like', "%{$search}%")
                   ->orWhere('email', 'like', "%{$search}%")
            ))
            ->when($rank, fn($q) => $q->whereHas('playerProfile', fn($qp) => $qp->where('rank_level', $rank)))
            ->with(['playerProfile', 'wallet'])
            ->paginate(10)
            ->withQueryString();

        // quick stats
        $allPlayers   = User::role('Player')->with('playerProfile')->get();
        $rankCounts   = $allPlayers->groupBy(fn($u) => $u->playerProfile?->rank_level ?? 'غير محدد')->map->count();

        return Inertia::render('Admin/Players/Index', [
            'players'    => $players,
            'filters'    => $request->only(['search', 'rank']),
            'stats'      => [
                'total'       => $allPlayers->count(),
                'with_wallet' => $allPlayers->filter(fn($u) => $u->wallet?->balance > 0)->count(),
                'rank_counts' => $rankCounts,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => 'nullable|required_without:phone|string|email|max:255|unique:users',
            'phone'          => 'nullable|required_without:email|string|max:255|unique:users',
            'password'       => ['required', Rules\Password::defaults()],
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'rank_level'     => 'required|string',
            'points'         => 'required|integer|min:0',
            'wallet_balance' => 'required|numeric|min:0',
            'matches_played' => 'required|integer|min:0',
            'matches_won'    => 'required|integer|min:0',
        ], [
            'name.required'           => 'الاسم الكامل مطلوب.',
            'name.max'                => 'الاسم يجب ألا يتجاوز 255 حرفاً.',
            'email.required_without'  => 'البريد الإلكتروني مطلوب في حال عدم إدخال رقم الجوال.',
            'email.email'             => 'صيغة البريد الإلكتروني غير صحيحة.',
            'email.unique'            => 'هذا البريد الإلكتروني مستخدم مسبقاً.',
            'phone.required_without'  => 'رقم الجوال مطلوب في حال عدم إدخال البريد الإلكتروني.',
            'phone.unique'            => 'رقم الجوال مستخدم مسبقاً.',
            'password.required'       => 'كلمة المرور مطلوبة.',
            'rank_level.required'     => 'المستوى مطلوب.',
            'points.required'         => 'حقل النقاط مطلوب.',
            'points.integer'          => 'النقاط يجب أن تكون رقماً صحيحاً.',
            'points.min'              => 'النقاط يجب أن تكون 0 أو أكثر.',
            'wallet_balance.required' => 'رصيد المحفظة مطلوب.',
            'wallet_balance.numeric'  => 'رصيد المحفظة يجب أن يكون رقماً.',
            'wallet_balance.min'      => 'رصيد المحفظة يجب أن يكون 0 أو أكثر.',
            'matches_played.required' => 'عدد المباريات مطلوب.',
            'matches_played.integer'  => 'عدد المباريات يجب أن يكون رقماً صحيحاً.',
            'matches_won.required'    => 'عدد الانتصارات مطلوب.',
            'matches_won.integer'     => 'عدد الانتصارات يجب أن يكون رقماً صحيحاً.',
            'image.image'             => 'الملف يجب أن يكون صورة.',
            'image.mimes'             => 'الصورة يجب أن تكون من نوع: jpeg, png, jpg, gif.',
            'image.max'               => 'حجم الصورة يجب ألا يتجاوز 2 ميغابايت.',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('profiles', 'public');
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'image_path' => $imagePath,
        ]);

        // Assign 'Player' role
        $user->assignRole('Player');

        // Create player profile
        PlayerProfile::create([
            'user_id' => $user->id,
            'rank_level' => $request->rank_level,
            'points' => $request->points,
            'matches_played' => $request->matches_played,
            'matches_won' => $request->matches_won,
        ]);

        // Create wallet
        Wallet::create([
            'user_id' => $user->id,
            'balance' => $request->wallet_balance,
        ]);

        return redirect()->back()->with('success', 'تم إضافة اللاعب بنجاح');
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
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'rank_level'     => 'required|string',
            'points'         => 'required|integer|min:0',
            'wallet_balance' => 'required|numeric|min:0',
            'matches_played' => 'required|integer|min:0',
            'matches_won'    => 'required|integer|min:0',
        ], [
            'name.required'            => 'الاسم الكامل مطلوب.',
            'name.max'                 => 'الاسم يجب ألا يتجاوز 255 حرفاً.',
            'email.required_without'   => 'البريد الإلكتروني مطلوب في حال عدم إدخال رقم الجوال.',
            'email.email'              => 'صيغة البريد الإلكتروني غير صحيحة.',
            'email.unique'             => 'هذا البريد الإلكتروني مستخدم مسبقاً.',
            'phone.required_without'   => 'رقم الجوال مطلوب في حال عدم إدخال البريد الإلكتروني.',
            'phone.unique'             => 'رقم الجوال مستخدم مسبقاً.',
            'rank_level.required'      => 'المستوى مطلوب.',
            'points.required'          => 'حقل النقاط مطلوب.',
            'points.integer'           => 'النقاط يجب أن تكون رقماً صحيحاً.',
            'points.min'               => 'النقاط يجب أن تكون 0 أو أكثر.',
            'wallet_balance.required'  => 'رصيد المحفظة مطلوب.',
            'wallet_balance.numeric'   => 'رصيد المحفظة يجب أن يكون رقماً.',
            'wallet_balance.min'       => 'رصيد المحفظة يجب أن يكون 0 أو أكثر.',
            'matches_played.required'  => 'عدد المباريات مطلوب.',
            'matches_played.integer'   => 'عدد المباريات يجب أن يكون رقماً صحيحاً.',
            'matches_won.required'     => 'عدد الانتصارات مطلوب.',
            'matches_won.integer'      => 'عدد الانتصارات يجب أن يكون رقماً صحيحاً.',
            'image.image'              => 'الملف يجب أن يكون صورة.',
            'image.mimes'              => 'الصورة يجب أن تكون من نوع: jpeg, png, jpg, gif.',
            'image.max'                => 'حجم الصورة يجب ألا يتجاوز 2 ميغابايت.',
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
            // Delete old image if exists
            if ($user->image_path) {
                Storage::disk('public')->delete($user->image_path);
            }
            $data['image_path'] = $request->file('image')->store('profiles', 'public');
        }

        $user->update($data);

        // Update or create player profile
        PlayerProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'rank_level' => $request->rank_level,
                'points' => $request->points,
                'matches_played' => $request->matches_played,
                'matches_won' => $request->matches_won,
            ]
        );

        // Update or create wallet
        Wallet::updateOrCreate(
            ['user_id' => $user->id],
            ['balance' => $request->wallet_balance]
        );

        return redirect()->back()->with('success', 'تم تحديث بيانات اللاعب بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        
        if ($user->image_path) {
            Storage::disk('public')->delete($user->image_path);
        }

        $user->delete();

        return redirect()->back()->with('success', 'تم حذف اللاعب بنجاح');
    }
}
