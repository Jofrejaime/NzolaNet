<?php

declare(strict_types=1);

namespace App\Services\Api;

use App\Data\Api\Post\CreatePostData;
use App\Events\PostCreated;
use App\Repositories\Api\PostRepository;
use App\Models\Post;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PostService
{
    public function __construct(
        protected PostRepository $postRepository
    ) {}

    /**
     * Obter feed principal de posts
     * Mostra posts de utilizadores seguidos + próprios posts
     * Se o utilizador não segue ninguém, mostra todos os posts
     */
    public function getPostsByUser(int $authorId, ?int $viewerId = null, int $perPage = 20)
    {
        return $this->postRepository->getPostsByUser($authorId, $viewerId, $perPage);
    }

    public function getFeed(?int $userId = null, int $perPage = 15)
    {
        if ($userId) {
            // Check if user follows anyone
            $followingCount = \DB::table('follows')
                ->where('follower_id', $userId)
                ->count();

            if ($followingCount > 0) {
                return $this->postRepository->getLatestPostsForUser($userId, $perPage);
            }
        }

        return $this->postRepository->getLatestPosts($perPage, $userId);
    }

    /**
     * Obter post específico
     */
    public function getPostById(int $id, ?int $userId = null): ?Post
    {
        $query = Post::query()
            ->whereHas('user', function ($q) use ($userId) {
                $q->where('is_active', true);

                if (!$userId) {
                    $q->where('is_private', false);
                    return;
                }

                $q->where(function ($privacy) use ($userId) {
                    $privacy
                        ->where('is_private', false)
                        ->orWhere('users.id', $userId)
                        ->orWhereExists(function ($followQuery) use ($userId) {
                            $followQuery
                                ->select(DB::raw(1))
                                ->from('follows')
                                ->where('follower_id', $userId)
                                ->whereColumn('following_id', 'users.id');
                        });
                });
            })
            ->with(['user'])
            ->withCount(['comments', 'bazes']);

        if ($userId) {
            $query->withExists([
                'bazes as has_bazed' => fn ($query) => $query->where('user_id', $userId),
            ]);
        }

        return $query->find($id);
    }

    /**
     * Criar novo post
     */
    public function create(CreatePostData $dto, int $userId): Post
    {
        $data = $dto->toArray();
        $data['user_id'] = $userId;

        $post = $this->postRepository->create($data);

        try {
            broadcast(new PostCreated($post));
        } catch (\Throwable $e) {
            \Log::error('[Realtime] PostCreated broadcast failed', ['error' => $e->getMessage()]);
            report($e);
        }

        return $post;
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

        $oldMedia = $post->media ?? [];

        $updated = $this->postRepository->update($data, $id);

        // Apagar ficheiros de média que foram removidos pelo utilizador
        if (array_key_exists('media', $data)) {
            $newPaths = array_column($data['media'], 'path');
            foreach ($oldMedia as $item) {
                if (!in_array($item['path'], $newPaths, true)) {
                    Storage::disk('public')->delete($item['path']);
                }
            }
        }

        return $updated->load('user')->loadCount(['comments', 'bazes']);
    }

    public function delete(int $id, int $userId): void
    {
        $post = $this->postRepository->find($id);

        if ($post->user_id !== $userId) {
            throw new AuthorizationException("Não tem permissão para excluir esta publicação.");
        }

        foreach ($post->media ?? [] as $item) {
            Storage::disk('public')->delete($item['path']);
        }
        if ($post->image) Storage::disk('public')->delete($post->image);
        if ($post->video) Storage::disk('public')->delete($post->video);

        $this->postRepository->delete($id);
    }
}
