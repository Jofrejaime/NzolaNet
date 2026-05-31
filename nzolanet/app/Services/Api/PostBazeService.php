<?php

declare(strict_types=1);

namespace App\Services\Api;

use App\Repositories\Api\PostBazeRepository;
use Illuminate\Validation\ValidationException;

class PostBazeService
{
    public function __construct(
        protected PostBazeRepository $postBazeRepository
    ) {}

    public function addBaze(int $userId, int $postId): void
    {
        $success = $this->postBazeRepository->addBaze($userId, $postId);

        if (!$success) {
            throw ValidationException::withMessages([
                'post_id' => ['Já deu baze nesta publicação.']
            ]);
        }
    }

    public function removeBaze(int $userId, int $postId): void
    {
        $success = $this->postBazeRepository->removeBaze($userId, $postId);

        if (!$success) {
            throw ValidationException::withMessages([
                'post_id' => ['Não deu baze nesta publicação.']
            ]);
        }
    }
}
