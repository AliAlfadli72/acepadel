<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->merge([
            'phone' => \App\Models\User::normalizePhone($request->phone),
        ]);

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => [
                'required',
                'regex:/^\+\d{8,15}$/',
                'unique:users,phone',
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'phone.required' => 'رقم الهاتف مطلوب.',
            'phone.regex' => 'يرجى إدخال رقم هاتف صحيح مع رمز البلد (مثال: +966512345678 أو +963991234567).',
            'phone.unique' => 'رقم الهاتف مستخدم بالفعل.',
        ]);

        $user = User::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        $user->assignRole('Player');

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
