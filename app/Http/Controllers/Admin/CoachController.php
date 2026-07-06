<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules;
use App\Services\ImageUploadService;
class CoachController extends Controller
{
    public function index()
    {
        $sixMonthsAgo = \Carbon\Carbon::now()->subMonths(5)->startOfMonth();

        // Get all users who have the role 'Coach' with their profile and aggregate bookings stats
        $coaches = User::role('Coach')->with([
            'coachProfile' => function ($query) use ($sixMonthsAgo) {
                $query->withCount(['bookings as total_sessions'])
                      ->withSum(['bookings as monthly_revenue' => function($q) {
                          $q->whereMonth('start_time', now()->month)
                            ->whereYear('start_time', now()->year);
                      }], 'total_price')
                      ->withSum('bookings as total_revenue', 'total_price')
                      ->with(['bookings' => function($q) use ($sixMonthsAgo) {
                          $q->where('start_time', '>=', $sixMonthsAgo)
                            ->select('id', 'coach_profile_id', 'start_time', 'total_price');
                      }]);
            },
            'coachProfile.courts', 
            'coachProfile.availabilities'
        ])->orderBy('id', 'desc')->get();

        $courts = \App\Models\Court::where('is_active', true)->select('id', 'name')->get();
        
        // Get all players who are NOT coaches yet, so we can promote them
        $eligiblePlayers = User::role('Player')->whereDoesntHave('roles', function($q) {
            $q->where('name', 'Coach');
        })->select('id', 'name', 'email', 'phone')->orderBy('name')->get();

        return Inertia::render('Admin/Coaches/Index', [
            'coaches' => $coaches,
            'courts' => $courts,
            'eligiblePlayers' => $eligiblePlayers
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'bio' => 'nullable|string',
            'specialty' => 'nullable|string|max:255',
            'hourly_rate' => 'nullable|numeric|min:0',
            'courts' => 'nullable|array',
            'courts.*' => 'exists:courts,id',
            'availabilities' => 'nullable|array',
            'availabilities.*.day_of_week' => 'required|integer|min:0|max:6',
            'availabilities.*.start_time' => 'required|date_format:H:i',
            'availabilities.*.end_time' => 'required|date_format:H:i|after:availabilities.*.start_time',
        ], [
            'user_id.required' => 'يرجى اختيار اللاعب المراد ترقيته.',
            'user_id.exists' => 'اللاعب المحدد غير موجود.',
            'availabilities.*.end_time.after' => 'يجب أن يكون وقت الانتهاء بعد وقت البدء.'
        ]);

        $user = User::findOrFail($validated['user_id']);

        if ($user->hasRole('Coach')) {
            return redirect()->back()->withErrors(['user_id' => 'هذا اللاعب هو مدرب بالفعل.']);
        }

        $user->assignRole('Coach');

        $profile = $user->coachProfile()->create([
            'bio' => $request->bio,
            'specialty' => $request->specialty,
            'hourly_rate' => $request->hourly_rate ?? 0,
        ]);

        if (!empty($validated['courts'])) {
            $profile->courts()->sync($validated['courts']);
        }

        if (!empty($validated['availabilities'])) {
            foreach ($validated['availabilities'] as $avail) {
                $profile->availabilities()->create($avail);
            }
        }

        return redirect()->back()->with('success', 'تم تعيين اللاعب كمدرب بنجاح.');
    }

    public function update(Request $request, User $coach)
    {
        // Ensure the user being updated is actually a coach
        if (!$coach->hasRole('Coach')) {
            abort(403, 'غير مصرح.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|required_without:phone|string|email|max:255|unique:users,email,'.$coach->id,
            'phone' => 'nullable|required_without:email|string|max:20|unique:users,phone,'.$coach->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'bio' => 'nullable|string',
            'specialty' => 'nullable|string|max:255',
            'hourly_rate' => 'nullable|numeric|min:0',
            'courts' => 'nullable|array',
            'courts.*' => 'exists:courts,id',
            'availabilities' => 'nullable|array',
            'availabilities.*.day_of_week' => 'required|integer|min:0|max:6',
            'availabilities.*.start_time' => 'required|date_format:H:i',
            'availabilities.*.end_time' => 'required|date_format:H:i|after:availabilities.*.start_time',
        ], [
            'availabilities.*.end_time.after' => 'يجب أن يكون وقت الانتهاء بعد وقت البدء.'
        ]);

        $coach->name = $validated['name'];
        if (isset($validated['email'])) $coach->email = $validated['email'];
        if (isset($validated['phone'])) $coach->phone = $validated['phone'];
        
        if (!empty($validated['password'])) {
            $coach->password = Hash::make($validated['password']);
        }

        if ($request->hasFile('image')) {
            if ($coach->image_path) {
                Storage::disk('public')->delete($coach->image_path);
            }
            $coach->image_path = ImageUploadService::upload(
                $request->file('image'),
                'coaches',
                $coach->image_path
            );        
        }

        $coach->save();

        $profile = $coach->coachProfile()->firstOrCreate(
            ['user_id' => $coach->id],
            ['hourly_rate' => 0]
        );

        $profile->update([
            'bio' => $request->bio,
            'specialty' => $request->specialty,
            'hourly_rate' => $request->hourly_rate ?? 0,
        ]);

        if (isset($validated['courts'])) {
            $profile->courts()->sync($validated['courts']);
        } else {
            $profile->courts()->detach();
        }

        if (isset($validated['availabilities'])) {
            $profile->availabilities()->delete();
            foreach ($validated['availabilities'] as $avail) {
                $profile->availabilities()->create($avail);
            }
        }

        return redirect()->back()->with('success', 'تم تحديث بيانات المدرب بنجاح.');
    }
    public function destroy(User $coach)
    {
        try {

            /*
            |--------------------------------------------------------------------------
            | Ensure User Is Coach
            |--------------------------------------------------------------------------
            */

            if (!$coach->hasRole('Coach')) {

                abort(403, 'غير مصرح.');
            }

            /*
            |--------------------------------------------------------------------------
            | Check Today & Future Sessions
            |--------------------------------------------------------------------------
            */

            $hasUpcomingBookings = $coach->coachProfile
                ?->bookings()
                ->where('end_time', '>=', now())
                ->whereIn('status', [
                    'pending',
                    'approved',
                ])
                ->exists();

            if ($hasUpcomingBookings) {

                return redirect()->back()->withErrors([
                    'error' => 'لا يمكن إزالة المدرب لوجود جلسات تدريب حالية أو مستقبلية.'
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Remove Coach Role
            |--------------------------------------------------------------------------
            */

            $coach->removeRole('Coach');

            return redirect()->back()->with(
                'success',
                'تم إزالة المدرب بنجاح.'
            );

        } catch (\Exception $e) {

            return redirect()->back()->withErrors([
                'error' => $e->getMessage()
            ]);
        }
    }


}
