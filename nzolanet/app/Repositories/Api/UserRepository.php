<?php

namespace App\Repositories\Api;

use Prettus\Repository\Contracts\RepositoryInterface;

/**
 * Interface UserRepository.
 *
 * @package namespace App\Repositories\Api;
 */
interface UserRepository extends RepositoryInterface
{
    public function findByEmail(string $email): ?array;
    public function findByCredentials(string $email, string $password): ?array;
}
