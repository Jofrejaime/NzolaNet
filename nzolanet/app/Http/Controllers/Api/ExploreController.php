<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Api\ExploreService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExploreController extends Controller
{
    public function __construct(
        protected ExploreService $exploreService
    ) {}

    /**
     * Get popular posts
     */
    public function popular(Request $request): JsonResponse
    {
        try {
            $user = $request->user('sanctum');
            $userId = $user ? $user->id : null;
            
            $posts = $this->exploreService->getPopularPosts($userId);

            return response()->json([
                'success' => true,
                'data' => $posts
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao listar posts populares: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get trending topics/hashtags
     */
    public function trends(): JsonResponse
    {
        try {
            $trends = $this->exploreService->getTrends();

            return response()->json([
                'success' => true,
                'data' => $trends
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao listar tendências: ' . $e->getMessage()
            ], 500);
        }
    }
}
