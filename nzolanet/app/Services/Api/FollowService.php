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

        // Fetch user to check privacy
        $user = \App\Models\User::find($followingId);
        if (!$user) {
            throw ValidationException::withMessages([
                'following_id' => ['Utilizador não encontrado.']
            ]);
        }

        $isAccepted = !$user->is_private;

        $success = $this->followRepository->follow($followerId, $followingId, $isAccepted);

        if (!$success) {
            throw ValidationException::withMessages([
                'following_id' => ['Ja segue ou já pediu para seguir este utilizador.']
            ]);
        }

        if ($isAccepted) {
            $this->notificationService->create(new NotificationData(
                userId: $followingId,
                type: 'follow',
                fromUserId: $followerId,
            ));
        } else {
            $this->notificationService->create(new NotificationData(
                userId: $followingId,
                type: 'follow_request',
                fromUserId: $followerId,
                followRequestStatus: 'pending',
            ));
        }
    }

    public function acceptRequest(int $followerId, int $followingId): void
    {
        $success = $this->followRepository->acceptRequest($followerId, $followingId);

        if (!$success) {
            throw ValidationException::withMessages([
                'follower_id' => ['Pedido não encontrado.']
            ]);
        }

        $this->notificationService->resolveFollowRequestNotification($followingId, $followerId, 'accepted');

        // Optionally notify the follower that their request was accepted
        // $this->notificationService->create(new NotificationData(
        //     userId: $followerId,
        //     type: 'follow_accepted',
        //     fromUserId: $followingId,
        // ));
    }

    public function rejectRequest(int $followerId, int $followingId): void
    {
        $success = $this->followRepository->rejectRequest($followerId, $followingId);

        if (!$success) {
            throw ValidationException::withMessages([
                'follower_id' => ['Pedido não encontrado.']
            ]);
        }

        $this->notificationService->resolveFollowRequestNotification($followingId, $followerId, 'rejected');
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
