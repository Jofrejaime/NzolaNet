<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Api\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $notifications = $this->notificationService->listForUser($request->user()->id);

            return response()->json([
                'success' => true,
                'data' => $notifications,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao listar notificacoes: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function markAsRead(int $id, Request $request): JsonResponse
    {
        try {
            $this->notificationService->markAsRead($id, $request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Notificacao marcada como lida.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar notificacao: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            $this->notificationService->markAllAsRead($request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Todas as notificacoes marcadas como lidas.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar notificacoes: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function unreadCount(Request $request): JsonResponse
    {
        try {
            $count = $this->notificationService->unreadCount($request->user()->id);

            return response()->json([
                'success' => true,
                'data' => ['count' => $count],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao contar notificacoes: ' . $e->getMessage(),
            ], 500);
        }
    }
}
