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
        $emailInput = $request->input('email');
        if ($emailInput && !filter_var($emailInput, FILTER_VALIDATE_EMAIL)) {
            $request->merge([
                'email' => User::normalizePhone($emailInput)
            ]);
        }

        $loginIdentifier = $request->email;
        $isEmail = filter_var($loginIdentifier, FILTER_VALIDATE_EMAIL);
        $column = $isEmail ? 'email' : 'phone';

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|max:255|unique:'.User::class.','.$column,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            $column => $loginIdentifier,
            'password' => Hash::make($request->password),
        ]);

        $user->assignRole('Player');

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
