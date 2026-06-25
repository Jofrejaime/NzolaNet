<?php

namespace App\Http\Controllers\Api;

use App\Events\NotificationCreated;
use App\Http\Controllers\Controller;
use App\Services\Api\PostBazeService;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BazeController extends Controller
{
    public function __construct(
        protected PostBazeService $postBazeService
    ) {}

    /**
     * Dar baze numa publicação
     * POST /api/posts/{postId}/baze
     */
    public function store(int $postId, Request $request): JsonResponse
    {
        try {
            $this->postBazeService->addBaze($request->user()->id, $postId);

            // Criar notificação para o dono do post
            $post = \App\Models\Post::find($postId);
            if ($post && $post->user_id !== $request->user()->id) {
                $notification = Notification::create([
                    'user_id' => $post->user_id,
                    'type' => 'baze',
                    'from_user_id' => $request->user()->id,
                    'post_id' => $postId,
                ]);

                broadcast(new NotificationCreated($notification));
            }

            return response()->json([
                'success' => true,
                'message' => 'Baze adicionado com sucesso!'
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao dar baze: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remover baze de uma publicação
     * DELETE /api/posts/{postId}/baze
     */
    public function destroy(int $postId, Request $request): JsonResponse
    {
        try {
            $this->postBazeService->removeBaze($request->user()->id, $postId);

            return response()->json([
                'success' => true,
                'message' => 'Baze removido com sucesso!'
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao remover baze: ' . $e->getMessage()
            ], 500);
        }
    }
}
