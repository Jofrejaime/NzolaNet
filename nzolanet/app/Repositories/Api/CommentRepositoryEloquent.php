<?php

namespace App\Repositories\Api;

use Prettus\Repository\Eloquent\BaseRepository;
use Prettus\Repository\Criteria\RequestCriteria;
use App\Repositories\Api\CommentRepository;
use App\Models\Comment;

class CommentRepositoryEloquent extends BaseRepository implements CommentRepository
{
    public function model()
    {
        return Comment::class;
    }

    public function boot()
    {
        $this->pushCriteria(app(RequestCriteria::class));
    }

    public function getCommentsForPost(int $postId, int $perPage = 15)
    {
        return $this->model
            ->where('post_id', $postId)
            ->whereNull('parent_id')
            ->with(['user', 'replies.user'])
            ->orderBy('created_at', 'asc')
            ->paginate($perPage);
    }

    public function getCommentsByUser(int $userId, ?int $viewerId = null, int $perPage = 20)
    {
        $query = $this->model
            ->where('user_id', $userId)
            ->whereHas('user', function ($q) use ($viewerId, $userId) {
                $q->where('is_active', true);
                if (!$viewerId || $viewerId !== $userId) {
                    $q->where(function ($privacy) use ($viewerId) {
                        $privacy->where('is_private', false);
                        if ($viewerId) {
                            $privacy->orWhere('users.id', $viewerId)
                                    ->orWhereExists(function ($f) use ($viewerId) {
                                        $f->select(\DB::raw(1))
                                          ->from('follows')
                                          ->where('follower_id', $viewerId)
                                          ->whereColumn('following_id', 'users.id');
                                    });
                        }
                    });
                }
            })
            ->with(['user', 'post.user'])
            ->orderBy('created_at', 'desc');

        return $query->paginate($perPage);
    }
}
