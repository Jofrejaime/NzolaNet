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
            ->where('is_accepted', true)
            ->exists();
    }

    public function isFollowPending(int $followerId, int $followingId): bool
    {
        return $this->model
            ->where('follower_id', $followerId)
            ->where('following_id', $followingId)
            ->where('is_accepted', false)
            ->exists();
    }

    public function follow(int $followerId, int $followingId, bool $isAccepted = true): bool
    {
        if ($this->model->where('follower_id', $followerId)->where('following_id', $followingId)->exists()) {
            return false;
        }

        $this->create([
            'follower_id' => $followerId,
            'following_id' => $followingId,
            'is_accepted' => $isAccepted,
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
            ->where('is_accepted', true)
            ->pluck('following_id')
            ->toArray();

        if (empty($followingIds)) {
            return [];
        }

        $users = \App\Models\User::whereIn('id', $followingIds)
            ->where('is_active', true)
            ->get();
        $result = [];

        foreach ($users as $user) {
            $isFollowing = $this->isFollowing($currentUserId, $user->id);
            $isFollowPending = $this->isFollowPending($currentUserId, $user->id);
            $result[] = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'bio' => $user->bio,
                'profile_photo' => $user->profile_photo,
                'is_private' => $user->is_private,
                'is_active' => $user->is_active,
                'is_following' => $isFollowing,
                'is_follow_pending' => $isFollowPending,
                'created_at' => $user->created_at,
            ];
        }

        return $result;
    }

    public function getFollowers(int $userId, int $currentUserId): array
    {
        $followerIds = $this->model
            ->where('following_id', $userId)
            ->where('is_accepted', true)
            ->pluck('follower_id')
            ->toArray();

        if (empty($followerIds)) {
            return [];
        }

        $users = \App\Models\User::whereIn('id', $followerIds)
            ->where('is_active', true)
            ->get();
        $result = [];

        foreach ($users as $user) {
            $isFollowing = $this->isFollowing($currentUserId, $user->id);
            $isFollowPending = $this->isFollowPending($currentUserId, $user->id);
            $result[] = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'bio' => $user->bio,
                'profile_photo' => $user->profile_photo,
                'is_private' => $user->is_private,
                'is_active' => $user->is_active,
                'is_following' => $isFollowing,
                'is_follow_pending' => $isFollowPending,
                'created_at' => $user->created_at,
            ];
        }

        return $result;
    }

    public function acceptRequest(int $followerId, int $followingId): bool
    {
        $follow = $this->model
            ->where('follower_id', $followerId)
            ->where('following_id', $followingId)
            ->where('is_accepted', false)
            ->first();

        if ($follow) {
            $follow->is_accepted = true;
            $follow->save();
            return true;
        }
        return false;
    }

    public function rejectRequest(int $followerId, int $followingId): bool
    {
        $follow = $this->model
            ->where('follower_id', $followerId)
            ->where('following_id', $followingId)
            ->where('is_accepted', false)
            ->first();

        if ($follow) {
            $follow->delete();
            return true;
        }
        return false;
    }
}
