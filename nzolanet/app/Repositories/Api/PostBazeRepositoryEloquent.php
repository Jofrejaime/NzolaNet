<?php

namespace App\Repositories\Api;

use Prettus\Repository\Eloquent\BaseRepository;
use App\Repositories\Api\PostBazeRepository;
use App\Models\PostBaze;

class PostBazeRepositoryEloquent extends BaseRepository implements PostBazeRepository
{
    public function model()
    {
        return PostBaze::class;
    }

    public function hasBazed(int $userId, int $postId): bool
    {
        return $this->model
            ->where('user_id', $userId)
            ->where('post_id', $postId)
            ->exists();
    }

    public function addBaze(int $userId, int $postId): bool
    {
        if ($this->hasBazed($userId, $postId)) {
            return false;
        }

        $this->create([
            'user_id' => $userId,
            'post_id' => $postId,
        ]);

        return true;
    }

    public function removeBaze(int $userId, int $postId): bool
    {
        $baze = $this->model
            ->where('user_id', $userId)
            ->where('post_id', $postId)
            ->first();

        if ($baze) {
            $baze->delete();
            return true;
        }

        return false;
    }
}
