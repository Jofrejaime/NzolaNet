<?php

namespace App\Data\Api\Post;

use Spatie\LaravelData\Data;

class CreatePostData extends Data
{
    public function __construct(
        public readonly ?string $content = null,
        public readonly ?string $image   = null,
        public readonly ?string $video   = null,
        public readonly ?array  $media   = null,
    ) {}

    public function toArray(): array
    {
        return [
            'content' => $this->content,
            'image'   => $this->image,
            'video'   => $this->video,
            'media'   => $this->media,
        ];
    }
}
