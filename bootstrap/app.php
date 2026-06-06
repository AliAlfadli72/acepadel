<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(\App\Http\Middleware\SetLocale::class);

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->api(append: [
            'throttle:api',
        ]);

        // Register Spatie Permission middleware aliases
        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {

        // $exceptions->render(function (Throwable $e, $request) {

        //     // Let Laravel handle validation errors normally
        //     if ($e instanceof ValidationException) {
        //         return null;
        //     }

        //     $status = $e instanceof HttpExceptionInterface
        //         ? $e->getStatusCode()
        //         : 500;

        //     if ($status === 403) {
        //         $status = 404;
        //     }

        //     // Do not render Inertia pages for API requests
        //     if ($request->is('api/*') || $request->expectsJson()) {
        //         return null;
        //     }

        //     if (in_array($status, [401, 404, 419, 429, 500, 503])) {
        //         return Inertia::render('Error', [
        //             'status' => $status,
        //         ])
        //         ->toResponse($request)
        //         ->setStatusCode($status);
        //     }

        //     return null;
        // });
    })->create();
