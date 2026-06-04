<?php

namespace App\Repositories\Api;

use Prettus\Repository\Contracts\RepositoryInterface;

interface CommentRepository extends RepositoryInterface
{
    public function getCommentsForPost(int $postId, int $perPage = 15);
    public function getCommentsByUser(int $userId, int $perPage = 20);
}
