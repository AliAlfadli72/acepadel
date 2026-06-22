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
use App\Services\ImageUploadService;
use App\Models\Booking;


class PlayerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $rank   = $request->input('rank');

            $players = User::whereHas('playerProfile')
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
      $allPlayers = User::whereHas('playerProfile')->with('playerProfile')->get();
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
            'name'                   => 'required|string|max:255',
            'phone'                  => 'required|string|max:255|unique:users,phone',
            'image'                  => 'nullable|image|mimes:jpeg,png,jpg,webp,avif|max:2048',
            'points'                 => 'required|integer|min:0',
            'wallet_balance'         => 'required|numeric|min:0',
            'pilates_wallet_balance' => 'required|numeric|min:0',
            'matches_played'         => 'required|integer|min:0',
            'matches_won'            => 'required|integer|min:0',
        ], [
            'name.required'                   => 'الاسم الكامل مطلوب.',
            'name.max'                        => 'الاسم يجب ألا يتجاوز 255 حرفاً.',
            'phone.required'                  => 'رقم الجوال مطلوب.',
            'phone.unique'                    => 'رقم الجوال مستخدم مسبقاً.',
            'points.required'                 => 'حقل النقاط مطلوب.',
            'wallet_balance.required'         => 'رصيد المحفظة (بادل) مطلوب.',
            'pilates_wallet_balance.required' => 'رصيد محفظة البيلاتس مطلوب.',
            'matches_played.required'         => 'عدد المباريات مطلوب.',
            'matches_won.required'            => 'عدد الانتصارات مطلوب.',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = ImageUploadService::upload($request->file('image'), 'profiles');
        }

        // المصادقة عبر واتساب OTP — لا كلمة سر ولا إيميل
        $user = User::create([
            'name'       => $request->name,
            'email'      => null,
            'phone'      => $request->phone,
            'password'   => null, // يدخل عبر OTP
            'image_path' => $imagePath,
        ]);

        $user->assignRole('Player');

        $user->playerProfile()->update([
            'points'         => $request->points,
            'matches_played' => $request->matches_played,
            'matches_won'    => $request->matches_won,
        ]);

        $walletService = app(\App\Services\WalletService::class);
        $wallet = $user->wallet ?: $user->wallet()->firstOrCreate([], ['balance' => 0, 'pilates_balance' => 0]);
        if ($request->wallet_balance > 0) {
            $walletService->deposit($wallet, $request->wallet_balance, 'رصيد ابتدائي عند تسجيل اللاعب (أدمن)', auth()->id());
        }
        if ($request->pilates_wallet_balance > 0) {
            $walletService->pilatesDeposit($wallet, $request->pilates_wallet_balance, 'رصيد بيلاتس ابتدائي عند تسجيل اللاعب (أدمن)', auth()->id());
        }

        return redirect()->back()->with('success', 'تم إضافة اللاعب بنجاح');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name'                   => 'required|string|max:255',
            'phone'                  => 'required|string|max:255|unique:users,phone,'.$user->id,
            'image'                  => 'nullable|image|mimes:jpeg,png,jpg,webp,avif|max:2048',
            'points'                 => 'required|integer|min:0',
            'wallet_balance'         => 'required|numeric|min:0',
            'pilates_wallet_balance' => 'required|numeric|min:0',
            'matches_played'         => 'required|integer|min:0',
            'matches_won'            => 'required|integer|min:0',
        ], [
            'name.required'  => 'الاسم الكامل مطلوب.',
            'phone.required' => 'رقم الجوال مطلوب.',
            'phone.unique'   => 'رقم الجوال مستخدم مسبقاً.',
        ]);

        $data = [
            'name'  => $request->name,
            'phone' => $request->phone,
        ];

        if ($request->hasFile('image')) {
            $data['image_path'] = ImageUploadService::upload(
                $request->file('image'),
                'profiles',
                $user->image_path
            );
        }
        $user->update($data);

        // Update or create player profile
        PlayerProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'points'         => $request->points,
                'matches_played' => $request->matches_played,
                'matches_won'    => $request->matches_won,
                // rank_level يُحسب تلقائياً من النقاط
            ]
        );

        // Update or create wallet
        if ($request->has('wallet_balance') && $request->wallet_balance !== null) {
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $user->id],
                ['balance' => 0, 'pilates_balance' => 0]
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

        if ($request->has('pilates_wallet_balance') && $request->pilates_wallet_balance !== null) {
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $user->id],
                ['balance' => 0, 'pilates_balance' => 0]
            );

            $oldPilatesBalance = (float) $wallet->pilates_balance;
            $newPilatesBalance = (float) $request->pilates_wallet_balance;

            if ($newPilatesBalance !== $oldPilatesBalance) {
                $walletService = app(\App\Services\WalletService::class);
                if ($newPilatesBalance > $oldPilatesBalance) {
                    $diff = $newPilatesBalance - $oldPilatesBalance;
                    $walletService->pilatesDeposit($wallet, $diff, 'شحن رصيد بيلاتس من قبل الإدارة', auth()->id());
                } else {
                    $diff = $oldPilatesBalance - $newPilatesBalance;
                    $walletService->pilatesManualAdjustment($wallet, $diff, 'تعديل رصيد بيلاتس يدوي (خصم) من قبل الإدارة', auth()->id());
                }
            }
        }

        return redirect()->back()->with('success', 'تم تحديث بيانات اللاعب بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */

    public function destroy(string $id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return back()->with('error', 'لا يمكنك حذف حسابك الخاص');
        }

        // Prevent deleting players with future bookings
        $upcomingBookingsCount = Booking::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->where('start_time', '>', now())
            ->count();

        if ($upcomingBookingsCount > 0) {
            return back()->with(
                'error',
                "لا يمكن حذف اللاعب لوجود {$upcomingBookingsCount} حجز قادم مرتبط به"
            );
        }

        if ($user->image_path) {
            Storage::disk('public')->delete($user->image_path);
        }

        $user->delete();

        return back()->with('success', 'تم حذف اللاعب بنجاح');
    }
}
