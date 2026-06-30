<?php

namespace App\Data\Api\Notification;

use Spatie\LaravelData\Data;

class NotificationData extends Data
{
    public function __construct(
        public readonly int $userId,
        public readonly string $type,
        public readonly ?int $fromUserId = null,
        public readonly ?int $postId = null,
        public readonly ?int $commentId = null,
    ) {}

    public function toArray(): array
    {
        return array_filter([
            'user_id' => $this->userId,
            'type' => $this->type,
            'from_user_id' => $this->fromUserId,
            'post_id' => $this->postId,
            'comment_id' => $this->commentId,
            'is_read' => false,
        ], fn ($value) => $value !== null);
    }
}
