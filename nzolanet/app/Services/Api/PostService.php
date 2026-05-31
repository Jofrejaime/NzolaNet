<?php

declare(strict_types=1);

namespace App\Services\Api;

use App\Data\Api\Post\CreatePostData;
use App\Repositories\Api\PostRepository;
use App\Models\Post;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Storage;

class PostService
{
    public function __construct(
        protected PostRepository $postRepository
    ) {}

    /**
     * Obter feed principal de posts
     */
    public function getFeed(?int $userId = null, int $perPage = 15)
    {
        if ($userId) {
            return $this->postRepository->getLatestPostsForUser($userId, $perPage);
        }

        return $this->postRepository->getLatestPosts($perPage);
    }

    /**
     * Obter post específico
     */
    public function getPostById(int $id): ?Post
    {
        return $this->postRepository->with(['user'])->withCount(['comments', 'bazes'])->find($id);
    }

    /**
     * Criar novo post
     */
    public function create(CreatePostData $dto, int $userId): Post
    {
        $data = $dto->toArray();
        $data['user_id'] = $userId;

        return $this->postRepository->create($data);
    }

    /**
     * Atualizar post próprio
     */
    public function update(int $id, array $data, int $userId): Post
    {
        $post = $this->postRepository->find($id);

        if ($post->user_id !== $userId) {
            throw new AuthorizationException("Não tem permissão para editar esta publicação.");
        }

        return $this->postRepository->update($data, $id);
    }

    /**
     * Excluir post próprio
     */
    public function delete(int $id, int $userId): void
    {
        $post = $this->postRepository->find($id);

        if ($post->user_id !== $userId) {
            throw new AuthorizationException("Não tem permissão para excluir esta publicação.");
        }

        // Remover ficheiros associados do storage se existirem
        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }
        if ($post->video) {
            Storage::disk('public')->delete($post->video);
        }

        $this->postRepository->delete($id);
    }
}
