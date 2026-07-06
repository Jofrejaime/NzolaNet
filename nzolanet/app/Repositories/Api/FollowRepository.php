<?php

namespace App\Repositories\Api;

use Prettus\Repository\Contracts\RepositoryInterface;

interface FollowRepository extends RepositoryInterface
{
    public function isFollowing(int $followerId, int $followingId): bool;
    public function isFollowPending(int $followerId, int $followingId): bool;
    public function follow(int $followerId, int $followingId, bool $isAccepted = true): bool;
    public function unfollow(int $followerId, int $followingId): bool;
    public function getFollowing(int $userId, int $currentUserId): array;
    public function getFollowers(int $userId, int $currentUserId): array;
    public function acceptRequest(int $followerId, int $followingId): bool;
    public function rejectRequest(int $followerId, int $followingId): bool;
}