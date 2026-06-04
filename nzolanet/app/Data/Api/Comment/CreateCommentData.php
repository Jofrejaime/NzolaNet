<?php

namespace App\Data\Api\Comment;

use Spatie\LaravelData\Data;
use App\Http\Requests\Api\CreateCommentRequest;

class CreateCommentData extends Data
{
    public function __construct(
        public readonly string $content,
        public readonly ?int $parentId = null,
    ) {}

    public static function fromRequest(CreateCommentRequest $request): self
    {
        return new self(
            content: $request->content,
            parentId: $request->input('parent_id') ? (int) $request->input('parent_id') : null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'content' => $this->content,
            'parent_id' => $this->parentId,
        ], fn ($value) => $value !== null);
    }
}
