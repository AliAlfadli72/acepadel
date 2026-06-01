<?php

namespace App\Http\Controllers;

use App\Models\PilatesPackage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PilatesPackageAdminController extends Controller
{
    /**
     * Display a listing of Pilates packages.
     */
    public function index()
    {
        $packages = PilatesPackage::orderBy('total_classes', 'asc')
            ->paginate(10);

        return Inertia::render('Admin/Pilates/Packages', [
            'packages' => $packages
        ]);
    }

    /**
     * Store a newly created package.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'total_classes' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'valid_days' => 'required|integer|min:1',
        ]);

        PilatesPackage::create($validated);

        return redirect()->back()->with('success', 'تم إنشاء باقة البيلاتس بنجاح.');
    }

    /**
     * Update package details.
     */
    public function update(Request $request, PilatesPackage $package)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'total_classes' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'valid_days' => 'required|integer|min:1',
        ]);

        $package->update($validated);

        return redirect()->back()->with('success', 'تم تحديث باقة البيلاتس بنجاح.');
    }

    /**
     * Delete the package.
     */
    public function destroy(PilatesPackage $package)
    {
        // Optional safety check: check if any active user subscriptions are linked to this package
        $activeSubCount = \App\Models\UserPilatesPackage::where('pilates_package_id', $package->id)
            ->where('expires_at', '>=', now())
            ->count();

        if ($activeSubCount > 0) {
            return redirect()->back()->withErrors([
                'error' => 'لا يمكن حذف هذه الباقة لوجود اشتراكات نشطة مرتبطة بها حالياً.'
            ]);
        }

        $package->delete();

        return redirect()->back()->with('success', 'تم حذف الباقة بنجاح.');
    }
}
