<?php

declare(strict_types=1);

namespace App\Services\Api;

use App\Data\Api\Notification\NotificationData;
use App\Events\CommentDeleted;
use App\Events\PostDeleted;
use App\Events\ReportCreated;
use App\Models\Comment;
use App\Models\Post;
use App\Repositories\Api\ReportRepository;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ReportService
{
    public function __construct(
        protected ReportRepository $reportRepository,
        protected NotificationService $notificationService,
    ) {}

    public function report(
        int     $reporterId,
        string  $type,
        int     $targetId,
        string  $reason,
        ?string $description = null
    ): array {
        if (!in_array($type, ['post', 'comment'])) {
            throw ValidationException::withMessages(['type' => ['Tipo de denúncia inválido.']]);
        }

        if ($this->reportRepository->alreadyReported($reporterId, $type, $targetId)) {
            throw ValidationException::withMessages(['general' => ['Já denunciaste este conteúdo.']]);
        }

        if ($type === 'post' && !Post::find($targetId)) {
            throw ValidationException::withMessages(['id' => ['Publicação não encontrada.']]);
        }
        if ($type === 'comment' && !Comment::find($targetId)) {
            throw ValidationException::withMessages(['id' => ['Comentário não encontrado.']]);
        }

        $report = $this->reportRepository->create([
            'reporter_id'     => $reporterId,
            'reportable_type' => $type,
            'reportable_id'   => $targetId,
            'reason'          => $reason,
            'description'     => $description,
            'status'          => 'pending',
        ]);

        $reportArray = $report->load('reporter')->toArray();

        // Notify all admins in real-time
        try {
            broadcast(new ReportCreated($reportArray));
        } catch (\Throwable $e) {
            \Log::error('[Realtime] ReportCreated broadcast failed', ['error' => $e->getMessage()]);
        }

        return $reportArray;
    }

    public function listReports(string $status = 'pending', int $perPage = 20)
    {
        $page = $this->reportRepository->listByStatus($status, $perPage);

        $page->getCollection()->transform(function ($report) {
            $report = $report->toArray();

            if ($report['reportable_type'] === 'post') {
                $post = Post::with('user')->withCount(['bazes', 'comments'])->find($report['reportable_id']);
                $report['content'] = $post ? $post->toArray() : null;
            } else {
                $comment = Comment::with('user')->find($report['reportable_id']);
                $report['content'] = $comment ? $comment->toArray() : null;
            }

            return $report;
        });

        return $page;
    }

    public function review(int $reportId, string $action, int $adminId): void
    {
        $report = $this->reportRepository->find($reportId);

        if (!$report) {
            throw ValidationException::withMessages(['id' => ['Denúncia não encontrada.']]);
        }

        if ($report->status !== 'pending') {
            throw ValidationException::withMessages(['status' => ['Esta denúncia já foi revista.']]);
        }

        if ($action === 'remove') {
            if ($report->reportable_type === 'post') {
                $post = Post::find($report->reportable_id);
                if ($post) {
                    $postId = $post->id;
                    if ($post->image) Storage::disk('public')->delete($post->image);
                    if ($post->video) Storage::disk('public')->delete($post->video);
                    $post->delete();

                    // Broadcast deletion to all clients
                    try {
                        broadcast(new PostDeleted($postId));
                    } catch (\Throwable $e) {
                        \Log::error('[Realtime] PostDeleted broadcast failed', ['error' => $e->getMessage()]);
                    }

                    // Notify the reporter
                    try {
                        $this->notificationService->create(new NotificationData(
                            userId: $report->reporter_id,
                            type: 'content_removed',
                            postId: $postId,
                        ));
                    } catch (\Throwable $e) {
                        \Log::error('[Notification] content_removed notification failed', ['error' => $e->getMessage()]);
                    }
                }
            } elseif ($report->reportable_type === 'comment') {
                $comment = Comment::find($report->reportable_id);
                if ($comment) {
                    $commentId = $comment->id;
                    $postId    = $comment->post_id;
                    $comment->delete();

                    // Broadcast deletion to all clients
                    try {
                        broadcast(new CommentDeleted($commentId, $postId));
                    } catch (\Throwable $e) {
                        \Log::error('[Realtime] CommentDeleted broadcast failed', ['error' => $e->getMessage()]);
                    }

                    // Notify the reporter
                    try {
                        $this->notificationService->create(new NotificationData(
                            userId: $report->reporter_id,
                            type: 'content_removed',
                            postId: $postId,
                            commentId: $commentId,
                        ));
                    } catch (\Throwable $e) {
                        \Log::error('[Notification] content_removed notification failed', ['error' => $e->getMessage()]);
                    }
                }
            }

            $newStatus = 'removed';
        } else {
            $newStatus = 'dismissed';
        }

        $this->reportRepository->update([
            'status'      => $newStatus,
            'reviewed_by' => $adminId,
            'reviewed_at' => now(),
        ], $reportId);
    }
}
