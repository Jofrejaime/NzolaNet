<?php

declare(strict_types=1);

namespace App\Services\Api;

use App\Data\Api\Comment\CreateCommentData;
use App\Repositories\Api\CommentRepository;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;

class CommentService
{
    public function __construct(
        protected CommentRepository $commentRepository
    ) {}

    /**
     * Listar comentários de um post
     */
    public function getCommentsForPost(int $postId, int $perPage = 15)
    {
        return $this->commentRepository->getCommentsForPost($postId, $perPage);
    }

    /**
     * Adicionar comentário
     */
    public function create(CreateCommentData $dto, int $postId, int $userId): Comment
    {
        return $this->commentRepository->create([
            'user_id' => $userId,
            'post_id' => $postId,
            'content' => $dto->content,
        ]);
    }

    /**
     * Editar comentário próprio
     */
    public function update(int $id, string $content, int $userId): Comment
    {
        $comment = $this->commentRepository->find($id);

        if ($comment->user_id !== $userId) {
            throw new AuthorizationException("Não tem permissão para editar este comentário.");
        }

        return $this->commentRepository->update([
            'content' => $content,
        ], $id);
    }

    /**
     * Excluir comentário (próprio ou por administrador)
     */
    public function delete(int $id, User $user): void
    {
        $comment = $this->commentRepository->find($id);

        // Permitir exclusão se for o autor OU se for administrador
        if ($comment->user_id !== $user->id && $user->role !== 'administrador') {
            throw new AuthorizationException("Não tem permissão para excluir este comentário.");
        }

        $this->commentRepository->delete($id);
    }
}
