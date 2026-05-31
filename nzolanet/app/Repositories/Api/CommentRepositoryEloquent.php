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
            ->with(['user'])
            ->orderBy('created_at', 'asc')
            ->paginate($perPage);
    }
}
