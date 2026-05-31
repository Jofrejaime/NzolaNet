<?php

namespace App\Repositories\Api;

use Prettus\Repository\Contracts\RepositoryInterface;

interface PostBazeRepository extends RepositoryInterface
{
    public function hasBazed(int $userId, int $postId): bool;
    public function addBaze(int $userId, int $postId): bool;
    public function removeBaze(int $userId, int $postId): bool;
}
