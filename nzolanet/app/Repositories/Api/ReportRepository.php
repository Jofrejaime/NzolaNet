<?php

namespace App\Repositories\Api;

use Prettus\Repository\Contracts\RepositoryInterface;

interface ReportRepository extends RepositoryInterface
{
    public function listByStatus(string $status, int $perPage = 20);
    public function alreadyReported(int $reporterId, string $type, int $targetId): bool;
}
