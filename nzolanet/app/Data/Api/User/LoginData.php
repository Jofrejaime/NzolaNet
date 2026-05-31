<?php

namespace App\Data\Api\User;

use App\Http\Requests\Api\LoginRequest;

class LoginData
{
    public function __construct(
        public readonly string $email,
        public readonly string $password,
        public readonly bool $rememberMe = false
    ) {}

    public static function fromRequest(LoginRequest $request): self
    {
        return new self(
            email: $request->email,
            password: $request->password,
            rememberMe: $request->remember_me ?? false
        );
    }

    public function toArray(): array
    {
        return [
            'email' => $this->email,
            'password' => $this->password
        ];
    }
}