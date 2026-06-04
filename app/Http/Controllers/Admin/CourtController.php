<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Court;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use App\Services\ImageUploadService;

class CourtController extends Controller
{
    public function index()
    {
        $courts = Court::withCount(['bookings as total_matches' => function ($query) {
            $query->whereIn('status', ['approved', 'completed']);
        }])
        ->withSum(['bookings as total_revenue' => function ($query) {
            $query->whereIn('status', ['approved', 'completed']);
        }], 'total_price')
        ->orderBy('id', 'desc')->get()->map(function($court) {
            $court->monthly_revenue = $court->bookings()
                ->whereIn('status', ['approved', 'completed'])
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('total_price') ?? 0;
                
            $court->monthly_matches = $court->bookings()
                ->whereIn('status', ['approved', 'completed'])
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();
            
            $court->total_revenue = $court->total_revenue ?? 0;
            return $court;
        });

        return Inertia::render('Admin/Courts/Index', [
            'courts' => $courts
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'type'        => 'required|in:indoor,outdoor',
            'price'       => 'required|integer|min:0',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,avif|max:10240'
        ], [
            'name.required'   => 'اسم الملعب مطلوب.',
            'name.max'        => 'اسم الملعب يجب ألا يتجاوز 255 حرفاً.',
            'type.required'   => 'نوع الملعب مطلوب.',
            'type.in'         => 'نوع الملعب يجب أن يكون داخلي أو خارجي.',
            'price.required'  => 'سعر الساعة مطلوب.',
            'price.integer'   => 'السعر يجب أن يكون رقماً صحيحاً.',
            'price.min'       => 'السعر يجب أن يكون 0 أو أكثر.',
            'image.image'     => 'الملف يجب أن يكون صورة.',
            'image.mimes'     => 'الصورة يجب أن تكون: jpeg, png, jpg, webp.',
            'image.max'       => 'حجم الصورة يجب ألا يتجاوز 10 ميغابايت.',
        ]);

        if ($request->hasFile('image')) {

            $validated['image_path'] = ImageUploadService::upload(
                $request->file('image'),
                'courts'
            );
        }

        Court::create($validated);

        return redirect()->back()->with('success', 'تم إضافة الملعب بنجاح.');
    }

    public function update(Request $request, Court $court)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'type'        => 'required|in:indoor,outdoor',
            'price'       => 'required|integer|min:0',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,avif|max:10240'
        ], [
            'name.required'   => 'اسم الملعب مطلوب.',
            'name.max'        => 'اسم الملعب يجب ألا يتجاوز 255 حرفاً.',
            'type.required'   => 'نوع الملعب مطلوب.',
            'type.in'         => 'نوع الملعب يجب أن يكون داخلي أو خارجي.',
            'price.required'  => 'سعر الساعة مطلوب.',
            'price.integer'   => 'السعر يجب أن يكون رقماً صحيحاً.',
            'price.min'       => 'السعر يجب أن يكون 0 أو أكثر.',
            'image.image'     => 'الملف يجب أن يكون صورة.',
            'image.mimes'     => 'الصورة يجب أن تكون: jpeg, png, jpg, webp.',
            'image.max'       => 'حجم الصورة يجب ألا يتجاوز 10 ميغابايت.',
        ]);

        if ($request->hasFile('image')) {
            if ($court->image_path) {
                Storage::disk('public')->delete($court->image_path);
            }
            $validated['image_path'] = ImageUploadService::upload(
                $request->file('image'),
                'courts',
                $court->image_path
            );
        }

        $court->update($validated);

        return redirect()->back()->with('success', 'تم تحديث الملعب بنجاح.');
    }

public function destroy(Court $court)
{
    try {

        $hasBookings = $court->bookings()->exists();

        if ($hasBookings) {

            return redirect()->back()->withErrors([
                'error' => 'لا يمكن حذف أو تعطيل الملعب لوجود حجوزات مرتبطة به.'
            ]);
        }

        if ($court->image_path) {
            Storage::disk('public')->delete($court->image_path);
        }

        $court->delete();

        return redirect()->back()->with(
            'success',
            'تم حذف الملعب بنجاح.'
        );

    } catch (\Exception $e) {

        return redirect()->back()->withErrors([
            'error' => $e->getMessage()
        ]);
    }
}
}
