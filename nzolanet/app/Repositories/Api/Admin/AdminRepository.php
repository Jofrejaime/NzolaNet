<?php

declare(strict_types=1);

namespace App\Repositories\Api\Admin;

interface AdminRepository
{
    public function getDashboardData(): array;
    public function listUsers(string $search = '', int $perPage = 20): array;
    public function toggleUserStatus(int $id): array;
    public function deleteUser(int $id, int $adminId): void;
    public function promoteToAdmin(int $id, int $superAdminId): array;
    public function demoteFromAdmin(int $id, int $superAdminId): array;
    public function listPosts(string $search = '', int $perPage = 20): array;
    public function deletePost(int $id): void;
    public function listComments(string $search = '', int $perPage = 20): array;
    public function deleteComment(int $id): void;
    public function forceLogoutUser(int $id): void;
}
