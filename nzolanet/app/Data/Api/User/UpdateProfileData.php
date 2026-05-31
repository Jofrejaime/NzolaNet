<?php

namespace App\Data\Api\User;

use Spatie\LaravelData\Data;
use App\Http\Requests\Api\UpdateProfileRequest;

class UpdateProfileData extends Data
{
    public function __construct(
        public readonly string $name,
        public readonly ?string $bio = null,
        public readonly bool $is_private = false
    ) {}

    public static function fromRequest(UpdateProfileRequest $request): self
    {
        return new self(
            name: $request->name,
            bio: $request->bio,
            is_private: $request->is_private ?? false
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'bio' => $this->bio,
            'is_private' => $this->is_private,
        ];
    }
}
