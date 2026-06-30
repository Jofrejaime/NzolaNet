<?php

declare(strict_types=1);

namespace App\Services\Api;

use App\Data\Api\Notification\NotificationData;
use App\Events\PostBazeUpdated;
use App\Models\Post;
use App\Repositories\Api\PostBazeRepository;
use Illuminate\Validation\ValidationException;

class PostBazeService
{
    public function __construct(
        protected PostBazeRepository $postBazeRepository,
        protected NotificationService $notificationService,
    ) {}

    public function addBaze(int $userId, int $postId): void
    {
        $success = $this->postBazeRepository->addBaze($userId, $postId);

        if (!$success) {
            throw ValidationException::withMessages([
                'post_id' => ['Ja deu baze nesta publicacao.']
            ]);
        }

        $post = Post::findOrFail($postId);
        $bazesCount = $post->bazes()->count();

        // Transmitir contagem atualizada em tempo real para outros utilizadores
        try {
            \Log::debug('[Realtime] Dispatching PostBazeUpdated', ['post_id' => $postId, 'count' => $bazesCount]);
            broadcast(new PostBazeUpdated($postId, $bazesCount));
            \Log::debug('[Realtime] PostBazeUpdated dispatched successfully');
        } catch (\Throwable $e) {
            \Log::error('[Realtime] PostBazeUpdated broadcast failed', ['error' => $e->getMessage()]);
            report($e);
        }

        if ($post->user_id !== $userId) {
            $this->notificationService->create(new NotificationData(
                userId: $post->user_id,
                type: 'baze',
                fromUserId: $userId,
                postId: $postId,
            ));
        }
    }

    public function removeBaze(int $userId, int $postId): void
    {
        $success = $this->postBazeRepository->removeBaze($userId, $postId);

        if (!$success) {
            throw ValidationException::withMessages([
                'post_id' => ['Nao deu baze nesta publicacao.']
            ]);
        }

        $post = Post::findOrFail($postId);
        $bazesCount = $post->bazes()->count();

        // Transmitir contagem atualizada em tempo real para outros utilizadores
        try {
            broadcast(new PostBazeUpdated($postId, $bazesCount));
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
