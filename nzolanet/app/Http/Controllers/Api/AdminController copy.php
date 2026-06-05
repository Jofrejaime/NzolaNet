<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Api\Admin\AdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct(
        protected AdminService $adminService
    ) {}

    /**
     * Dashboard com estatísticas e gráficos
     */
    public function dashboard(): JsonResponse
    {
        $dashboard = $this->adminService->getDashboard();

        return response()->json([
            'success' => true,
            'data' => $dashboard->toArray(),
        ]);
    }

    /**
     * Listar utilizadores
     */
    public function users(Request $request): JsonResponse
    {
        $search = $request->query('search', '');
        $data = $this->adminService->listUsers($search, (int) $request->query('per_page', 20));

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * Ativar/desativar utilizador (força logout ao desativar)
     */
    public function toggleUser(int $id): JsonResponse
    {
        $user = $this->adminService->toggleUser($id);

        // Force logout when deactivating
        if (!$user['is_active']) {
            $this->adminService->forceLogoutUser($id);
        }

        return response()->json([
            'success' => true,
            'message' => $user['is_active'] ? 'Utilizador activado.' : 'Utilizador desactivado.',
            'data' => $user,
        ]);
    }

    /**
     * Eliminar utilizador (impede eliminar administradores)
     */
    public function deleteUser(int $id, Request $request): JsonResponse
    {
        try {
            $this->adminService->deleteUser($id, $request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Utilizador eliminado.',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Promover utilizador a administrador (ou admin a superadmin) — só superadmin
     */
    public function promoteToAdmin(int $id, Request $request): JsonResponse
    {
        try {
            $user = $this->adminService->promoteToAdmin($id, $request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Função actualizada com sucesso.',
                'data' => $user,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Remover função de administrador — só superadmin
     */
    public function demoteFromAdmin(int $id, Request $request): JsonResponse
    {
        try {
            $user = $this->adminService->demoteFromAdmin($id, $request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Função actualizada com sucesso.',
                'data' => $user,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Listar publicações
     */
    public function posts(Request $request): JsonResponse
    {
        $data = $this->adminService->listPosts((int) $request->query('per_page', 20));

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * Eliminar publicação
     */
    public function deletePost(int $id): JsonResponse
    {
        $this->adminService->deletePost($id);

        return response()->json([
            'success' => true,
            'message' => 'Publicação eliminada.',
        ]);
    }

    /**
     * Listar comentários
     */
    public function comments(Request $request): JsonResponse
    {
        $data = $this->adminService->listComments((int) $request->query('per_page', 20));

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * Eliminar comentário
     */
    public function deleteComment(int $id): JsonResponse
    {
        $this->adminService->deleteComment($id);

        return response()->json([
            'success' => true,
            'message' => 'Comentário eliminado.',
        ]);
    }
}