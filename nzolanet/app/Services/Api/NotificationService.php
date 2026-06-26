<?php

declare(strict_types=1);

namespace App\Services\Api;

use App\Data\Api\Notification\NotificationData;
use App\Events\NotificationCreated;
use App\Models\Notification;
use App\Repositories\Api\NotificationRepository;
use Throwable;

class NotificationService
{
    public function __construct(
        protected NotificationRepository $notificationRepository,
    ) {}

    public function listForUser(int $userId, int $perPage = 20)
    {
        return $this->notificationRepository->getForUser($userId, $perPage);
    }

    public function create(NotificationData $dto, bool $broadcast = true): Notification
    {
        $notification = $this->notificationRepository->create($dto->toArray());
        $notification->loadMissing(['fromUser', 'post', 'comment']);

        if ($broadcast) {
            $this->broadcast($notification);
        }

        return $notification;
    }

    public function markAsRead(int $id, int $userId): void
    {
        $this->notificationRepository->markAsRead($id, $userId);
    }

    public function markAllAsRead(int $userId): void
    {
        $this->notificationRepository->markAllAsRead($userId);
    }

    public function unreadCount(int $userId): int
    {
        return $this->notificationRepository->unreadCount($userId);
    }

    private function broadcast(Notification $notification): void
    {
        try {
            broadcast(new NotificationCreated($notification));
        } catch (Throwable $e) {
            report($e);
        }
    }
}
