<?php

namespace App\Events;

use App\Models\Comment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class CommentCreated implements ShouldBroadcastNow
{
    public function __construct(public Comment $comment)
    {
        $this->comment->loadMissing(['user', 'replies.user']);
    }

    public function broadcastOn(): Channel
    {
        return new Channel('posts');
    }

    public function broadcastAs(): string
    {
        return 'comment.created';
    }

    public function broadcastWith(): array
    {
        return ['comment' => $this->comment->toArray()];
    }
}
