<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReportCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public array $report) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('admin');
    }

    public function broadcastAs(): string
    {
        return 'report.created';
    }

    public function broadcastWith(): array
    {
        return ['report' => $this->report];
    }
}
