<?php

namespace App\Repositories\Api;

use Prettus\Repository\Eloquent\BaseRepository;
use Prettus\Repository\Criteria\RequestCriteria;
use App\Repositories\Api\UserRepository;
use App\Models\User;
use App\Validators\Api\UserValidator;
use Illuminate\Support\Facades\Hash;

/**
 * Class UserRepositoryEloquent.
 *
 * @package namespace App\Repositories\Api;
 */
class UserRepositoryEloquent extends BaseRepository implements UserRepository
{
    /**
     * Specify Model class name
     *
     * @return string
     */
    public function model()
    {
        return User::class;
    }

    public function findByEmail(string $email): ?array
    {
        $user = $this->findWhere(['email' => $email])->first();
        return $user ? $user->toArray() : null;
    }

    public function findByCredentials(string $email, string $password): ?array
    {
        $user = $this->findWhere(['email' => $email])->first();
        if ($user && Hash::check($password, $user['password'])) {
            return $user->toArray();
        }
        return null;
    }

    public function searchUsers(string $search, int $currentUserId): array
    {
        $query = $this->model
            ->where('id', '!=', $currentUserId)
            ->where('is_active', true);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Add is_following status for the current user
        $users = $query->limit(50)->get();

        $result = [];
        foreach ($users as $user) {
            $isFollowing = \DB::table('follows')
                ->where('follower_id', $currentUserId)
                ->where('following_id', $user->id)
                ->exists();

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

    /**
     * Boot up the repository, pushing criteria
     */
    public function boot()
    {
        $this->pushCriteria(app(RequestCriteria::class));
    }
}
