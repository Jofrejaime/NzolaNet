<?php

namespace App\Data\Api\Comment;

use Spatie\LaravelData\Data;
use App\Http\Requests\Api\CreateCommentRequest;

class CreateCommentData extends Data
{
    public function __construct(
        public readonly string $content
    ) {}

    public static function fromRequest(CreateCommentRequest $request): self
    {
        return new self(
            content: $request->content
        );
    }

    public function toArray(): array
    {
        return [
            'content' => $this->content,
        ];
    }
}
