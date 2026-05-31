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


    /**
     * Boot up the repository, pushing criteria
     */
    public function boot()
    {
        $this->pushCriteria(app(RequestCriteria::class));
    }
}
