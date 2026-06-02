<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Listar notificações do utilizador autenticado
     * GET /api/notifications
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $notifications = Notification::where('user_id', $request->user()->id)
                ->with(['fromUser', 'post', 'comment'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $notifications
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao listar notificações: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marcar notificação como lida
     * PUT /api/notifications/{id}/read
     */
    public function markAsRead(int $id, Request $request): JsonResponse
    {
        try {
            $notification = Notification::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            $notification->update(['is_read' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Notificação marcada como lida.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar notificação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marcar todas as notificações como lidas
     * PUT /api/notifications/read-all
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            Notification::where('user_id', $request->user()->id)
                ->where('is_read', false)
                ->update(['is_read' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Todas as notificações marcadas como lidas.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar notificações: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Contagem de notificações não lidas
     * GET /api/notifications/unread-count
     */
    public function unreadCount(Request $request): JsonResponse
    {
        try {
            $count = Notification::where('user_id', $request->user()->id)
                ->where('is_read', false)
                ->count();

            return response()->json([
                'success' => true,
                'data' => ['count' => $count]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao contar notificações: ' . $e->getMessage()
            ], 500);
        }
    }
}
