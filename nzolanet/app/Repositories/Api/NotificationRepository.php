<?php

namespace App\Repositories\Api;

use Prettus\Repository\Contracts\RepositoryInterface;

interface NotificationRepository extends RepositoryInterface
{
    public function getForUser(int $userId, int $perPage = 20);
    public function markAsRead(int $id, int $userId): void;
    public function markAllAsRead(int $userId): void;
    public function unreadCount(int $userId): int;
}
