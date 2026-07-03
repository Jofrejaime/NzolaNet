<?php

declare(strict_types=1);

namespace App\Services\Api;

use App\Data\Api\Comment\CreateCommentData;
use App\Data\Api\Notification\NotificationData;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Repositories\Api\CommentRepository;
use Illuminate\Auth\Access\AuthorizationException;

class CommentService
{
    public function __construct(
        protected CommentRepository $commentRepository,
        protected NotificationService $notificationService,
    ) {}

    public function getCommentsForPost(int $postId, int $perPage = 15)
    {
        return $this->commentRepository->getCommentsForPost($postId, $perPage);
    }

    public function create(CreateCommentData $dto, int $postId, int $userId): Comment
    {
        $post = Post::findOrFail($postId);

        if ($dto->parentId) {
            $parent = $this->commentRepository->find($dto->parentId);
            if ($parent->post_id !== $postId) {
                throw new AuthorizationException('A resposta deve pertencer a mesma publicacao.');
            }
        }

        $comment = $this->commentRepository->create([
            'user_id' => $userId,
            'post_id' => $postId,
            'parent_id' => $dto->parentId,
            'content' => $dto->content,
        ])->load(['user', 'parent.user']);

        if ($post->user_id !== $userId) {
            $this->notificationService->create(new NotificationData(
                userId: $post->user_id,
                type: 'comment',
                fromUserId: $userId,
                postId: $postId,
                commentId: $comment->id,
            ));
        }

        return $comment;
    }

    public function getCommentsByUser(int $userId, ?int $viewerId = null, int $perPage = 20)
    {
        return $this->commentRepository->getCommentsByUser($userId, $viewerId, $perPage);
    }

    public function update(int $id, string $content, int $userId): Comment
    {
        $comment = $this->commentRepository->find($id);

        if ($comment->user_id !== $userId) {
            throw new AuthorizationException('Nao tem permissao para editar este comentario.');
        }

        return $this->commentRepository->update([
            'content' => $content,
        ], $id);
    }

    public function delete(int $id, User $user): void
    {
        $comment = $this->commentRepository->find($id);

        if ($comment->user_id !== $user->id && $user->role !== 'administrador') {
            throw new AuthorizationException('Nao tem permissao para excluir este comentario.');
        }

        $this->commentRepository->delete($id);
    }
}
