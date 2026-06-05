<?php

declare(strict_types=1);

namespace App\Services\Api\Admin;

use App\Data\Api\Admin\AdminDashboardData;
use App\Repositories\Api\Admin\AdminRepository;

class AdminService
{
    public function __construct(
        protected AdminRepository $adminRepository
    ) {}

    public function getDashboard(): AdminDashboardData
    {
        $data = $this->adminRepository->getDashboardData();

        return AdminDashboardData::from($data);
    }

    public function listUsers(string $search = '', int $perPage = 20): array
    {
        return $this->adminRepository->listUsers($search, $perPage);
    }

    public function toggleUser(int $id): array
    {
        return $this->adminRepository->toggleUserStatus($id);
    }

    public function deleteUser(int $id, int $adminId): void
    {
        $this->adminRepository->deleteUser($id, $adminId);
    }

    public function listPosts(string $search = '', int $perPage = 20): array
    {
        return $this->adminRepository->listPosts($search, $perPage);
    }

    public function deletePost(int $id): void
    {
        $this->adminRepository->deletePost($id);
    }

    public function listComments(string $search = '', int $perPage = 20): array
    {
        return $this->adminRepository->listComments($search, $perPage);
    }

    public function deleteComment(int $id): void
    {
        $this->adminRepository->deleteComment($id);
    }

    public function promoteToAdmin(int $id, int $superAdminId): array
    {
        return $this->adminRepository->promoteToAdmin($id, $superAdminId);
    }

    public function demoteFromAdmin(int $id, int $superAdminId): array
    {
        return $this->adminRepository->demoteFromAdmin($id, $superAdminId);
    }

    public function forceLogoutUser(int $id): void
    {
        $this->adminRepository->forceLogoutUser($id);
    }
}
