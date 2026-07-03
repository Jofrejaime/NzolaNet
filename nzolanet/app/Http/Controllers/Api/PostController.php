<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CreatePostRequest;
use App\Data\Api\Post\CreatePostData;
use App\Services\Api\PostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Auth\Access\AuthorizationException;

class PostController extends Controller
{
    public function __construct(
        protected PostService $postService
    ) {}

    /**
     * Listar feed de posts
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user('sanctum');
            $userId = $user ? $user->id : null;
            
            $posts = $this->postService->getFeed($userId);

            return response()->json([
                'success' => true,
                'data' => $posts
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao listar publicações: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Visualizar post específico
     */
    public function show(int $id): JsonResponse
    {
        try {
            $user = request()->user('sanctum');
            $post = $this->postService->getPostById($id, $user?->id);

            if (!$post) {
                return response()->json([
                    'success' => false,
                    'message' => 'Publicação não encontrada.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $post
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar publicação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Criar publicação
     */
    public function store(CreatePostRequest $request): JsonResponse
    {
        try {
            $imagePath = null;
            $videoPath = null;

            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('posts/images', 'public');
            }

            if ($request->hasFile('video')) {
                $videoPath = $request->file('video')->store('posts/videos', 'public');
            }

            $dto = CreatePostData::fromRequest($request, $imagePath, $videoPath);
            $post = $this->postService->create($dto, $request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Publicação criada com sucesso!',
                'data' => $post
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar publicação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Editar publicação própria
     */
    public function update(int $id, CreatePostRequest $request): JsonResponse
    {
        try {
            $data = [];
            if ($request->has('content')) {
                $data['content'] = $request->input('content');
            }

            if ($request->boolean('remove_image')) {
                $data['image'] = null;
            } elseif ($request->hasFile('image')) {
                $data['image'] = $request->file('image')->store('posts/images', 'public');
            }

            if ($request->boolean('remove_video')) {
                $data['video'] = null;
            } elseif ($request->hasFile('video')) {
                $data['video'] = $request->file('video')->store('posts/videos', 'public');
            }

            $post = $this->postService->update($id, $data, $request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Publicação atualizada com sucesso!',
                'data' => $post
            ], 200);

        } catch (AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar publicação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Excluir publicação própria
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        try {
            $this->postService->delete($id, $request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Publicação excluída com sucesso!'
            ], 200);

        } catch (AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir publicação: ' . $e->getMessage()
            ], 500);
        }
    }
}
