<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'logo_url' => asset('logo.png'),
            'icon_url' => asset('icon.png'),
            'auth' => [
                'user' => $request->user() ? array_merge($request->user()->toArray(), [
                    'roles' => $request->user()->getRoleNames()
                ]) : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'booking_id' => fn () => $request->session()->get('booking_id'),
            ],
            'permissions' => fn () => auth()->check()
                ? auth()->user()->getAllPermissions()->pluck('name')
                : [],

            'roles' => fn () => auth()->check()
                    ? auth()->user()->getRoleNames()
                    : [],
        ];
    }
}
