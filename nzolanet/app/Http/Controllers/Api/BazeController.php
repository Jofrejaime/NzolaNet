<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Api\PostBazeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BazeController extends Controller
{
    public function __construct(
        protected PostBazeService $postBazeService
    ) {}

    public function store(int $postId, Request $request): JsonResponse
    {
        try {
            $this->postBazeService->addBaze($request->user()->id, $postId);

            return response()->json([
                'success' => true,
                'message' => 'Baze adicionado com sucesso!',
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao dar baze: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(int $postId, Request $request): JsonResponse
    {
        try {
            $this->postBazeService->removeBaze($request->user()->id, $postId);

            return response()->json([
                'success' => true,
                'message' => 'Baze removido com sucesso!',
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao remover baze: ' . $e->getMessage(),
            ], 500);
        }
    }
}
