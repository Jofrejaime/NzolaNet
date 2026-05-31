<?php

namespace App\Repositories\Api;

use Prettus\Repository\Contracts\RepositoryInterface;

interface FollowRepository extends RepositoryInterface
{
    public function isFollowing(int $followerId, int $followingId): bool;
    public function follow(int $followerId, int $followingId): bool;
    public function unfollow(int $followerId, int $followingId): bool;
}
