<?php

namespace App\Repositories\Api;

use Prettus\Repository\Eloquent\BaseRepository;
use Prettus\Repository\Criteria\RequestCriteria;
use App\Repositories\Api\PostRepository;
use App\Models\Post;
use Illuminate\Support\Facades\DB;

class PostRepositoryEloquent extends BaseRepository implements PostRepository
{
    public function model()
    {
        return Post::class;
    }

    public function boot()
    {
        $this->pushCriteria(app(RequestCriteria::class));
    }

    public function getLatestPosts(int $perPage = 15, ?int $userId = null)
    {
        $query = $this->model
            ->whereHas('user', function ($q) use ($userId) {
                $q->where('is_active', true);
                $this->applyUserPrivacy($q, $userId);
            })
            ->with(['user'])
            ->withCount(['comments', 'bazes'])
            ->orderBy('created_at', 'desc');

        if ($userId) {
            $query->withExists([
                'bazes as has_bazed' => fn ($query) => $query->where('user_id', $userId),
            ]);
        }

        return $query->paginate($perPage);
    }

    public function getLatestPostsForUser(int $userId, int $perPage = 15)
    {
        // Get followed user IDs first (only active users)
        $followingIds = \DB::table('follows')
            ->where('follower_id', $userId)
            ->join('users', 'users.id', '=', 'follows.following_id')
            ->where('users.is_active', true)
            ->pluck('follows.following_id')
            ->toArray();

        // Include own posts (even if inactive, you see your own)
        $followingIds[] = $userId;

        return $this->model
            ->whereIn('user_id', $followingIds)
            ->with(['user'])
            ->withCount(['comments', 'bazes'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getPostsByUser(int $authorId, ?int $viewerId = null, int $perPage = 20)
    {
        $query = $this->model
            ->where('user_id', $authorId)
            ->whereHas('user', function ($q) use ($viewerId) {
                $q->where('is_active', true);
                $this->applyUserPrivacy($q, $viewerId);
            })
            ->with(['user'])
            ->withCount(['comments', 'bazes'])
            ->orderBy('created_at', 'desc');

        if ($viewerId) {
            $query->withExists([
                'bazes as has_bazed' => fn ($q) => $q->where('user_id', $viewerId),
            ]);
        }

        return $query->paginate($perPage);
    }

    private function applyUserPrivacy($query, ?int $viewerId): void
    {
        if (!$viewerId) {
            $query->where('is_private', false);
            return;
        }

        $query->where(function ($privacy) use ($viewerId) {
            $privacy
                ->where('is_private', false)
                ->orWhere('users.id', $viewerId)
                ->orWhereExists(function ($followQuery) use ($viewerId) {
                    $followQuery
                        ->select(DB::raw(1))
                        ->from('follows')
                        ->where('follower_id', $viewerId)
                        ->whereColumn('following_id', 'users.id');
                });
        });
    }

    public function getPopularPosts(?int $viewerId = null, int $perPage = 15)
    {
        $query = $this->model
            ->whereHas('user', function ($q) use ($viewerId) {
                $q->where('is_active', true);
                $this->applyUserPrivacy($q, $viewerId);
            })
            ->with(['user'])
            ->withCount(['comments', 'bazes'])
            // Order by the sum of comments and bazes to show popularity
            ->orderByDesc(DB::raw('(SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id) + (SELECT COUNT(*) FROM post_bazes WHERE post_bazes.post_id = posts.id)'))
            ->orderByDesc('created_at');

        if ($viewerId) {
            $query->withExists([
                'bazes as has_bazed' => fn ($query) => $query->where('user_id', $viewerId),
            ]);
        }

        return $query->paginate($perPage);
    }

    public function getRecentPublicPosts(int $limit = 100)
    {
        return $this->model
            ->whereHas('user', function ($q) {
                $q->where('is_active', true)
                  ->where('is_private', false);
            })
            ->select('id', 'content', 'created_at')
            ->whereNotNull('content')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }
}
