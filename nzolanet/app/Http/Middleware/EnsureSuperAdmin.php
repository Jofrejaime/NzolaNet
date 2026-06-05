<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdmin
{
    /**
     * Only superadministrador can access these routes
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || $user->role !== 'superadministrador') {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado. Permissões de super-administrador necessárias.',
            ], 403);
        }

        return $next($request);
    }
}