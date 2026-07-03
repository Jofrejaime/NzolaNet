<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Api\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReportController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    /**
     * Criar denúncia
     * POST /api/reports
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type'        => 'required|in:post,comment',
            'id'          => 'required|integer',
            'reason'      => 'required|in:spam,inappropriate,offensive,misinformation,other',
            'description' => 'nullable|string|max:500',
        ], [
            'type.required'   => 'O tipo de denúncia é obrigatório.',
            'type.in'         => 'Tipo de denúncia inválido.',
            'id.required'     => 'O ID do conteúdo é obrigatório.',
            'reason.required' => 'O motivo da denúncia é obrigatório.',
            'reason.in'       => 'Motivo inválido.',
        ]);

        try {
            $report = $this->reportService->report(
                reporterId:  $request->user()->id,
                type:        $validated['type'],
                targetId:    (int) $validated['id'],
                reason:      $validated['reason'],
                description: $validated['description'] ?? null,
            );

            return response()->json([
                'success' => true,
                'message' => 'Denúncia enviada com sucesso.',
                'data'    => $report,
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao enviar denúncia: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Listar denúncias (admin)
     * GET /api/admin/reports
     */
    public function index(Request $request): JsonResponse
    {
        $status  = $request->query('status', 'pending');
        $perPage = (int) $request->query('per_page', 20);

        $reports = $this->reportService->listReports($status, $perPage);

        return response()->json([
            'success' => true,
            'data'    => $reports,
        ]);
    }

    /**
     * Rever denúncia (admin)
     * PATCH /api/admin/reports/{id}
     */
    public function review(int $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:remove,dismiss',
        ], [
            'action.required' => 'A ação é obrigatória.',
            'action.in'       => 'Ação inválida. Use "remove" ou "dismiss".',
        ]);

        try {
            $this->reportService->review($id, $validated['action'], $request->user()->id);

            $message = $validated['action'] === 'remove'
                ? 'Conteúdo removido e denúncia encerrada.'
                : 'Denúncia dispensada.';

            return response()->json(['success' => true, 'message' => $message]);

        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
