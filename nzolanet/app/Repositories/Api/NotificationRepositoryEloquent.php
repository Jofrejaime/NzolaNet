<?php

namespace App\Repositories\Api;

use App\Models\Notification;
use Prettus\Repository\Eloquent\BaseRepository;
use Prettus\Repository\Criteria\RequestCriteria;

class NotificationRepositoryEloquent extends BaseRepository implements NotificationRepository
{
    public function model()
    {
        return Notification::class;
    }

    public function boot()
    {
        $this->pushCriteria(app(RequestCriteria::class));
    }

    public function getForUser(int $userId, int $perPage = 20)
    {
        return $this->model
            ->where('user_id', $userId)
            ->with(['fromUser', 'post', 'comment'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function markAsRead(int $id, int $userId): void
    {
        $this->model
            ->where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail()
            ->update(['is_read' => true]);
    }

    public function markAllAsRead(int $userId): void
    {
        $this->model
            ->where('user_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);
    }

    public function unreadCount(int $userId): int
    {
        return $this->model
            ->where('user_id', $userId)
            ->where('is_read', false)
            ->count();
    }

    public function resolveFollowRequestNotification(int $userId, int $fromUserId, string $status): void
    {
        $this->model
            ->where('user_id', $userId)
            ->where('from_user_id', $fromUserId)
            ->where('type', 'follow_request')
            ->where('follow_request_status', 'pending')
            ->update(['follow_request_status' => $status, 'is_read' => true]);
    }
}
