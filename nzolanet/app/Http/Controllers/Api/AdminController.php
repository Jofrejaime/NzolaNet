<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function users(Request $request): JsonResponse
    {
        $search = $request->query('search', '');
        $query = User::query()->orderByDesc('created_at');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate(20);

        return response()->json(['success' => true, 'data' => $users]);
    }

    public function toggleUser(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'success' => true,
            'message' => $user->is_active ? 'Utilizador activado.' : 'Utilizador desactivado.',
            'data' => $user,
        ]);
    }

    public function deleteUser(int $id, Request $request): JsonResponse
    {
        if ($request->user()->id === $id) {
            return response()->json([
                'success' => false,
                'message' => 'Não pode eliminar a sua própria conta por aqui.',
            ], 422);
        }

        User::findOrFail($id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Utilizador eliminado.',
        ]);
    }

    public function posts(Request $request): JsonResponse
    {
        $posts = Post::query()
            ->with(['user'])
            ->withCount(['comments', 'bazes'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $posts]);
    }

    public function deletePost(int $id): JsonResponse
    {
        $post = Post::findOrFail($id);

        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }
        if ($post->video) {
            Storage::disk('public')->delete($post->video);
        }

        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Publicação eliminada.',
        ]);
    }

    public function comments(Request $request): JsonResponse
    {
        $comments = Comment::query()
            ->with(['user', 'post'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $comments]);
    }

    public function deleteComment(int $id): JsonResponse
    {
        Comment::findOrFail($id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Comentário eliminado.',
        ]);
    }
}
