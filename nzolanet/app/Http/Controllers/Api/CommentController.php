<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CreateCommentRequest;
use App\Data\Api\Comment\CreateCommentData;
use App\Services\Api\CommentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Auth\Access\AuthorizationException;

class CommentController extends Controller
{
    public function __construct(
        protected CommentService $commentService
    ) {}

    /**
     * Listar comentários de uma publicação
     */
    public function index(int $postId): JsonResponse
    {
        try {
            $comments = $this->commentService->getCommentsForPost($postId);

            return response()->json([
                'success' => true,
                'data' => $comments
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao listar comentários: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Adicionar comentário
     */
    public function store(int $postId, CreateCommentRequest $request): JsonResponse
    {
        try {
            $dto = CreateCommentData::fromRequest($request);
            $comment = $this->commentService->create($dto, $postId, $request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Comentário adicionado com sucesso!',
                'data' => $comment
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao adicionar comentário: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Editar comentário próprio
     */
    public function update(int $id, CreateCommentRequest $request): JsonResponse
    {
        try {
            $comment = $this->commentService->update($id, $request->content, $request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Comentário atualizado com sucesso!',
                'data' => $comment
            ], 200);

        } catch (AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar comentário: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Excluir comentário
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        try {
            $this->commentService->delete($id, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Comentário excluído com sucesso!'
            ], 200);

        } catch (AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir comentário: ' . $e->getMessage()
            ], 500);
        }
    }
}
