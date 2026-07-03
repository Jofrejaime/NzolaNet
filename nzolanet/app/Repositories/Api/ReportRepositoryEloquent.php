<?php

namespace App\Repositories\Api;

use App\Models\Report;
use Prettus\Repository\Eloquent\BaseRepository;
use Prettus\Repository\Criteria\RequestCriteria;

class ReportRepositoryEloquent extends BaseRepository implements ReportRepository
{
    public function model(): string
    {
        return Report::class;
    }

    public function boot(): void
    {
        $this->pushCriteria(app(RequestCriteria::class));
    }

    public function listByStatus(string $status, int $perPage = 20)
    {
        return $this->model
            ->where('status', $status)
            ->with(['reporter', 'reviewer'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function alreadyReported(int $reporterId, string $type, int $targetId): bool
    {
        return $this->model
            ->where('reporter_id', $reporterId)
            ->where('reportable_type', $type)
            ->where('reportable_id', $targetId)
            ->exists();
    }
}
