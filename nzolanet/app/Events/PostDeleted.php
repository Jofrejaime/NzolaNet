<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PostDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public int $postId) {}

    public function broadcastOn(): Channel
    {
        return new Channel('posts');
    }

    public function broadcastAs(): string
    {
        return 'post.deleted';
    }

    public function broadcastWith(): array
    {
        return ['post_id' => $this->postId];
    }
}
