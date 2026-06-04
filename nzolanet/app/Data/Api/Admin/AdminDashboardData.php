<?php

declare(strict_types=1);

namespace App\Data\Api\Admin;

use Spatie\LaravelData\Data;

class AdminDashboardData extends Data
{
    public function __construct(
        public readonly int $totalUsers,
        public readonly int $activeUsers,
        public readonly int $inactiveUsers,
        public readonly int $totalPosts,
        public readonly int $totalComments,
        public readonly int $totalBazes,
        public readonly int $totalAdmins,
        public readonly array $recentUsers,
        public readonly array $recentPosts,
        public readonly array $usersByMonth,
        public readonly array $postsByMonth,
    ) {}
}