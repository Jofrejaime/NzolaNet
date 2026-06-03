<?php

namespace App\Repositories\Api;

use Prettus\Repository\Eloquent\BaseRepository;
use Prettus\Repository\Criteria\RequestCriteria;
use App\Repositories\Api\PostRepository;
use App\Models\Post;

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
        // Get followed user IDs first
        $followingIds = \DB::table('follows')
            ->where('follower_id', $userId)
            ->pluck('following_id')
            ->toArray();

        // Include own posts
        $followingIds[] = $userId;

        return $this->model
            ->whereIn('user_id', $followingIds)
            ->with(['user'])
            ->withCount(['comments', 'bazes'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
}
