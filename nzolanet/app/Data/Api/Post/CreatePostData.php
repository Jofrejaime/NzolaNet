<?php

namespace App\Data\Api\Post;

use Spatie\LaravelData\Data;
use App\Http\Requests\Api\CreatePostRequest;

class CreatePostData extends Data
{
    public function __construct(
        public readonly ?string $content = null,
        public readonly ?string $image = null,
        public readonly ?string $video = null
    ) {}

    public static function fromRequest(CreatePostRequest $request, ?string $imagePath = null, ?string $videoPath = null): self
    {
        return new self(
            content: $request->content,
            image: $imagePath,
            video: $videoPath
        );
    }

    public function toArray(): array
    {
        return [
            'content' => $this->content,
            'image' => $this->image,
            'video' => $this->video,
        ];
    }
}
