<?php

namespace App\Repositories\Api;

use Prettus\Repository\Contracts\RepositoryInterface;

interface PostRepository extends RepositoryInterface
{
    public function getLatestPosts(int $perPage = 15, ?int $userId = null);
    public function getLatestPostsForUser(int $userId, int $perPage = 15);
}
