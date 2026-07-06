<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CreatePostRequest;
use App\Data\Api\Post\CreatePostData;
use App\Models\Post;
use App\Services\Api\PostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function __construct(
        protected PostService $postService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $user   = $request->user('sanctum');
            $userId = $user ? $user->id : null;
            $posts  = $this->postService->getFeed($userId);

            return response()->json(['success' => true, 'data' => $posts], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erro ao listar publicações: ' . $e->getMessage()], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $user = request()->user('sanctum');
            $post = $this->postService->getPostById($id, $user?->id);

            if (!$post) {
                return response()->json(['success' => false, 'message' => 'Publicação não encontrada.'], 404);
            }

            return response()->json(['success' => true, 'data' => $post], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erro ao buscar publicação: ' . $e->getMessage()], 500);
        }
    }

    public function store(CreatePostRequest $request): JsonResponse
    {
        try {
            $mediaItems = [];

            if ($request->hasFile('media')) {
                foreach ($request->file('media') as $file) {
                    $mime   = $file->getMimeType() ?? '';
                    $type   = str_starts_with($mime, 'image/') ? 'image' : 'video';
                    $folder = $type === 'image' ? 'posts/images' : 'posts/videos';
                    $path   = $file->store($folder, 'public');
                    $mediaItems[] = ['type' => $type, 'path' => $path];
                }
            }

            $dto  = new CreatePostData(content: $request->content, media: $mediaItems ?: null);
            $post = $this->postService->create($dto, $request->user()->id);

            return response()->json(['success' => true, 'message' => 'Publicação criada com sucesso!', 'data' => $post], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erro ao criar publicação: ' . $e->getMessage()], 500);
        }
    }

    public function update(int $id, CreatePostRequest $request): JsonResponse
    {
        try {
            $data = [];

            if ($request->has('content')) {
                $data['content'] = $request->input('content');
            }

            // Kept existing media items (sent as JSON string)
            $keepMedia = json_decode($request->input('keep_media', '[]'), true) ?? [];

            // New uploaded files
            $newMedia = [];
            if ($request->hasFile('media')) {
                foreach ($request->file('media') as $file) {
                    $mime   = $file->getMimeType() ?? '';
                    $type   = str_starts_with($mime, 'image/') ? 'image' : 'video';
                    $folder = $type === 'image' ? 'posts/images' : 'posts/videos';
                    $path   = $file->store($folder, 'public');
                    $newMedia[] = ['type' => $type, 'path' => $path];
                }
            }

            $data['media'] = array_merge($keepMedia, $newMedia);

            $post = $this->postService->update($id, $data, $request->user()->id);

            return response()->json(['success' => true, 'message' => 'Publicação atualizada com sucesso!', 'data' => $post], 200);
        } catch (AuthorizationException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 403);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erro ao atualizar publicação: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(int $id, Request $request): JsonResponse
    {
        try {
            $this->postService->delete($id, $request->user()->id);
            return response()->json(['success' => true, 'message' => 'Publicação excluída com sucesso!'], 200);
        } catch (AuthorizationException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 403);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erro ao excluir publicação: ' . $e->getMessage()], 500);
        }
    }
}
