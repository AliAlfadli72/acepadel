<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->header('Accept-Language');

        if (!$locale || !in_array($locale, ['ar', 'en'])) {
            $locale = $request->input('lang') ?? $request->input('locale') ?? config('app.locale', 'ar');
        }

        // Standardize locale to two characters
        $locale = substr(strtolower($locale), 0, 2);

        if (in_array($locale, ['ar', 'en'])) {
            app()->setLocale($locale);

            // Sync user preference if authenticated
            $user = $request->user('sanctum') ?? auth('sanctum')->user();

            // Resolve user from Bearer token if running before Sanctum's route middleware
            if (!$user && $request->bearerToken()) {
                $token = \Laravel\Sanctum\PersonalAccessToken::findToken($request->bearerToken());
                if ($token) {
                    $user = $token->tokenable;
                }
            }

            if ($user && (!isset($user->locale) || $user->locale !== $locale)) {
                $user->locale = $locale;
                $user->save();
            }
        }

        return $next($request);
    }
}
