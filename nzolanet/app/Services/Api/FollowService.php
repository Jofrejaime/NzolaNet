<?php

declare(strict_types=1);

namespace App\Services\Api;

use App\Repositories\Api\FollowRepository;
use Illuminate\Validation\ValidationException;

class FollowService
{
    public function __construct(
        protected FollowRepository $followRepository
    ) {}

    public function follow(int $followerId, int $followingId): void
    {
        if ($followerId === $followingId) {
            throw ValidationException::withMessages([
                'following_id' => ['Não pode seguir-se a si próprio.']
            ]);
        }

        $success = $this->followRepository->follow($followerId, $followingId);

        if (!$success) {
            throw ValidationException::withMessages([
                'following_id' => ['Já segue este utilizador.']
            ]);
        }
    }

    public function unfollow(int $followerId, int $followingId): void
    {
        $success = $this->followRepository->unfollow($followerId, $followingId);

        if (!$success) {
            throw ValidationException::withMessages([
                'following_id' => ['Não segue este utilizador.']
            ]);
        }
    }

    public function getFollowing(int $userId, int $currentUserId): array
    {
        return $this->followRepository->getFollowing($userId, $currentUserId);
    }

    public function getFollowers(int $userId, int $currentUserId): array
    {
        return $this->followRepository->getFollowers($userId, $currentUserId);
    }
}
