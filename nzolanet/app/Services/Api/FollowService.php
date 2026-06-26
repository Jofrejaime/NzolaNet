<?php

declare(strict_types=1);

namespace App\Services\Api;

use App\Data\Api\Notification\NotificationData;
use App\Repositories\Api\FollowRepository;
use Illuminate\Validation\ValidationException;

class FollowService
{
    public function __construct(
        protected FollowRepository $followRepository,
        protected NotificationService $notificationService,
    ) {}

    public function follow(int $followerId, int $followingId): void
    {
        if ($followerId === $followingId) {
            throw ValidationException::withMessages([
                'following_id' => ['Nao pode seguir-se a si proprio.']
            ]);
        }

        $success = $this->followRepository->follow($followerId, $followingId);

        if (!$success) {
            throw ValidationException::withMessages([
                'following_id' => ['Ja segue este utilizador.']
            ]);
        }

        $this->notificationService->create(new NotificationData(
            userId: $followingId,
            type: 'follow',
            fromUserId: $followerId,
        ));
    }

    public function unfollow(int $followerId, int $followingId): void
    {
        $success = $this->followRepository->unfollow($followerId, $followingId);

        if (!$success) {
            throw ValidationException::withMessages([
                'following_id' => ['Nao segue este utilizador.']
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
