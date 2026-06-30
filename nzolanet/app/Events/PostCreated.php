<?php

namespace App\Events;

use App\Models\Post;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PostCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Post $post
    ) {
        $this->post->loadMissing(['user']);
        $this->post->loadCount(['comments', 'bazes']);
    }

    public function broadcastOn(): Channel
    {
        return new Channel('posts');
    }

    public function broadcastAs(): string
    {
        return 'post.created';
    }

    public function broadcastWith(): array
    {
        return [
            'post' => array_merge($this->post->toArray(), [
                'comments_count' => $this->post->comments_count ?? 0,
                'bazes_count'    => $this->post->bazes_count ?? 0,
                'has_bazed'      => false,
            ]),
        ];
    }
}
