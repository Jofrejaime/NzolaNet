<?php

declare(strict_types=1);

namespace App\Repositories\Api\Admin;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AdminRepositoryEloquent implements AdminRepository
{
    public function getDashboardData(): array
    {
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $inactiveUsers = User::where('is_active', false)->count();
        $totalPosts = Post::count();
        $totalComments = Comment::count();
        $totalBazes = DB::table('post_bazes')->count();
        $totalAdmins = User::where('role', 'administrador')->count();

        // Recent users (last 7)
        $recentUsers = User::orderByDesc('created_at')->limit(7)->get()->toArray();

        // Recent posts (last 7)
        $recentPosts = Post::with(['user'])
            ->withCount(['comments', 'bazes'])
            ->orderByDesc('created_at')
            ->limit(7)
            ->get()
            ->toArray();

        // Users by month (last 6 months)
        $usersByMonth = User::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as total")
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month')
            ->toArray();

        // Posts by month (last 6 months)
        $postsByMonth = Post::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as total")
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month')
            ->toArray();

        return [
            'totalUsers' => $totalUsers,
            'activeUsers' => $activeUsers,
            'inactiveUsers' => $inactiveUsers,
            'totalPosts' => $totalPosts,
            'totalComments' => $totalComments,
            'totalBazes' => $totalBazes,
            'totalAdmins' => $totalAdmins,
            'recentUsers' => $recentUsers,
            'recentPosts' => $recentPosts,
            'usersByMonth' => $usersByMonth,
            'postsByMonth' => $postsByMonth,
        ];
    }

    public function listUsers(string $search = '', int $perPage = 20): array
    {
        $query = User::query()->orderByDesc('created_at');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $result = $query->paginate($perPage);
        return $result->toArray();
    }

    public function toggleUserStatus(int $id): array
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);
        return $user->toArray();
    }

    public function deleteUser(int $id, int $adminId): void
    {
        $user = User::findOrFail($id);

        // Cannot delete yourself
        if ($user->id === $adminId) {
            throw ValidationException::withMessages([
                'user' => ['Não pode eliminar a sua própria conta por aqui.'],
            ]);
        }

        // Cannot delete other administrators
        if ($user->role === 'administrador') {
            throw ValidationException::withMessages([
                'user' => ['Não é possível eliminar um administrador.'],
            ]);
        }

        // Delete user's posts (with media)
        $posts = Post::where('user_id', $user->id)->get();
        foreach ($posts as $post) {
            if ($post->image) {
                Storage::disk('public')->delete($post->image);
            }
            if ($post->video) {
                Storage::disk('public')->delete($post->video);
            }
        }
        Post::where('user_id', $user->id)->delete();

        // Delete user's comments
        Comment::where('user_id', $user->id)->delete();

        // Remove follows
        DB::table('follows')->where('follower_id', $user->id)->orWhere('following_id', $user->id)->delete();

        // Remove bazes
        DB::table('post_bazes')->where('user_id', $user->id)->delete();

        $user->delete();
    }

    public function listPosts(string $search = '', int $perPage = 20): array
    {
        $query = Post::query()
            ->with(['user'])
            ->withCount(['comments', 'bazes']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('content', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%"));
            });
        }

        $posts = $query->orderByDesc('created_at')->paginate($perPage);

        return $posts->toArray();
    }

    public function deletePost(int $id): void
    {
        $post = Post::findOrFail($id);

        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }
        if ($post->video) {
            Storage::disk('public')->delete($post->video);
        }

        Comment::where('post_id', $post->id)->delete();
        DB::table('post_bazes')->where('post_id', $post->id)->delete();

        $post->delete();
    }

    public function listComments(string $search = '', int $perPage = 20): array
    {
        $query = Comment::query()
            ->with(['user', 'post']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('content', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%"));
            });
        }

        $comments = $query->orderByDesc('created_at')->paginate($perPage);

        return $comments->toArray();
    }

    public function deleteComment(int $id): void
    {
        Comment::findOrFail($id)->delete();
    }

    public function promoteToAdmin(int $id, int $superAdminId): array
    {
        $user = User::findOrFail($id);

        // Cannot promote yourself
        if ($user->id === $superAdminId) {
            throw ValidationException::withMessages([
                'user' => ['Não pode alterar a sua própria função.'],
            ]);
        }

        // Cannot promote superadmins
        if ($user->role === 'superadministrador') {
            throw ValidationException::withMessages([
                'user' => ['Este utilizador já é super-administrador.'],
            ]);
        }

        // If already admin, promote to superadmin
        if ($user->role === 'administrador') {
            $user->update(['role' => 'superadministrador']);
            $this->forceLogoutUser($user->id);
            return $user->fresh()->toArray();
        }

        // Regular user -> promote to admin
        $user->update(['role' => 'administrador', 'is_active' => true]);
        return $user->fresh()->toArray();
    }

    public function demoteFromAdmin(int $id, int $superAdminId): array
    {
        $user = User::findOrFail($id);

        // Cannot demote yourself
        if ($user->id === $superAdminId) {
            throw ValidationException::withMessages([
                'user' => ['Não pode alterar a sua própria função.'],
            ]);
        }

        // Cannot demote other superadmins
        if ($user->role === 'superadministrador') {
            throw ValidationException::withMessages([
                'user' => ['Não é possível alterar a função de outro super-administrador.'],
            ]);
        }

        // Only admins can be demoted
        if ($user->role !== 'administrador') {
            throw ValidationException::withMessages([
                'user' => ['Este utilizador não é administrador.'],
            ]);
        }

        $user->update(['role' => 'utilizador']);
        $this->forceLogoutUser($user->id);
        return $user->fresh()->toArray();
    }

    public function forceLogoutUser(int $id): void
    {
        $user = User::findOrFail($id);
        // Delete all tokens to force logout
        $user->tokens()->delete();
    }
}
