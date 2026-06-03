<?php

namespace App\Repositories\Api;

use Prettus\Repository\Eloquent\BaseRepository;
use App\Repositories\Api\FollowRepository;
use App\Models\Follow;

class FollowRepositoryEloquent extends BaseRepository implements FollowRepository
{
    public function model()
    {
        return Follow::class;
    }

    public function isFollowing(int $followerId, int $followingId): bool
    {
        return $this->model
            ->where('follower_id', $followerId)
            ->where('following_id', $followingId)
            ->exists();
    }

    public function follow(int $followerId, int $followingId): bool
    {
        if ($this->isFollowing($followerId, $followingId)) {
            return false;
        }

        $this->create([
            'follower_id' => $followerId,
            'following_id' => $followingId,
        ]);

        return true;
    }

    public function unfollow(int $followerId, int $followingId): bool
    {
        $follow = $this->model
            ->where('follower_id', $followerId)
            ->where('following_id', $followingId)
            ->first();

        if ($follow) {
            $follow->delete();
            return true;
        }

        return false;
    }

    public function getFollowing(int $userId, int $currentUserId): array
    {
        $followingIds = $this->model
            ->where('follower_id', $userId)
            ->pluck('following_id')
            ->toArray();

        if (empty($followingIds)) {
            return [];
        }

        $users = \App\Models\User::whereIn('id', $followingIds)->get();
        $result = [];

        foreach ($users as $user) {
            $isFollowing = $this->isFollowing($currentUserId, $user->id);
            $result[] = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'bio' => $user->bio,
                'profile_photo' => $user->profile_photo,
                'is_private' => $user->is_private,
                'is_active' => $user->is_active,
                'is_following' => $isFollowing,
                'created_at' => $user->created_at,
            ];
        }

        return $result;
    }

    public function getFollowers(int $userId, int $currentUserId): array
    {
        $followerIds = $this->model
            ->where('following_id', $userId)
            ->pluck('follower_id')
            ->toArray();

        if (empty($followerIds)) {
            return [];
        }

        $users = \App\Models\User::whereIn('id', $followerIds)->get();
        $result = [];

        foreach ($users as $user) {
            $isFollowing = $this->isFollowing($currentUserId, $user->id);
            $result[] = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'bio' => $user->bio,
                'profile_photo' => $user->profile_photo,
                'is_private' => $user->is_private,
                'is_active' => $user->is_active,
                'is_following' => $isFollowing,
                'created_at' => $user->created_at,
            ];
        }

        return $result;
    }
}
