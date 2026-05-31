<?php

namespace App\Data\Api\User;

use Spatie\LaravelData\Data;
use App\Http\Requests\Api\RegisterRequest;

class RegisterData extends Data
{
    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly string $password,
        public readonly ?string $bio = null,
        public readonly ?string $profile_photo = null,
        public readonly bool $is_private = false
    ) {}
    public static function fromRequest(RegisterRequest $request): self
    {
        return new self(
            name: $request->name,
            email: $request->email,
            password: $request->password,
            bio: $request->bio,
            profile_photo: $request->profile_photo,
            is_private: $request->is_private ?? false
        );
    }
    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'email' => $this->email,
            'password' => bcrypt($this->password),
            'bio' => $this->bio,
            'profile_photo' => $this->profile_photo,
            'is_private' => $this->is_private,
            'is_active' => true,
        ];
    }
}
