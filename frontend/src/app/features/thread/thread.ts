import { Component, OnInit, OnDestroy, ChangeDetectorRef, ApplicationRef, NgZone, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { Comment, Post } from '../../core/models/api.models';
import { ApiUrlService } from '../../core/services/api-url.service';
import { AuthService } from '../../core/services/auth.service';
import { CommentService } from '../../core/services/comment.service';
import { PostService } from '../../core/services/post.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { ToastService } from '../../core/services/toast.service';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';

@Component({
  selector: 'nzola-thread',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonComponent],
  templateUrl: './thread.html',
  styleUrls: ['./thread.scss'],
  host: { class: 'block w-full' }
})
export class ThreadComponent implements OnInit, OnDestroy {
  private realtimeService = inject(RealtimeService);
  private realtimeBazeSub?: Subscription;

  post: Post | null = null;
  comments: Comment[] = [];
  commentContent = '';
  isLoading = false;
  isCommenting = false;
  errorMessage = '';
  editingPost = false;
  editPostContent = '';
  editingCommentId: number | null = null;
  editCommentContent = '';

  // Menu properties
  showPostMenu = false;
  activeCommentMenuId: number | null = null;

  // Reply properties
  replyingToCommentId: number | null = null;
  replyContent = '';
  isReplying = false;

  // Dialog properties
  showDeletePostDialog = false;
  showDeleteCommentDialog = false;
  commentToDelete: Comment | null = null;

  // Baze animation
  isBazing = false;
  
  // Skeleton items
  skeletonItems = [1, 2, 3];

  private toastService = inject(ToastService);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private postService: PostService,
    private commentService: CommentService,
    public authService: AuthService,
    private apiUrl: ApiUrlService,
    private cdr: ChangeDetectorRef,
    private appRef: ApplicationRef,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage = 'Publicacao invalida.';
      return;
    }

    this.loadThread(id);
    // Ensure the public posts channel is connected before subscribing to updates
    this.realtimeService.connectToPublicChannels();
    this.listenForRealtimeBazes();
  }

  ngOnDestroy(): void {
    this.realtimeBazeSub?.unsubscribe();
  }

  private listenForRealtimeBazes(): void {
    this.realtimeBazeSub = this.realtimeService.postBazeUpdates$.subscribe((update) => {
      if (this.post && this.post.id === update.post_id) {
        this.post = { ...this.post, bazes_count: update.bazes_count };
        this.cdr.detectChanges();
      }
    });
  }

  // Fechar menus ao clicar fora
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (
      !target.closest('.menu-trigger') &&
      !target.closest('.comment-menu-trigger') &&
      !target.closest('.post-menu-dropdown')
    ) {
      this.showPostMenu = false;
      this.activeCommentMenuId = null;
    }
    if (!target.closest('.reply-container') && !target.closest('.reply-trigger')) {
      this.replyingToCommentId = null;
      this.replyContent = '';
    }
  }

  // Navegar para o perfil do utilizador
  goToUserProfile(userId: number | undefined, event: Event): void {
    event.stopPropagation();
    if (userId) {
      this.router.navigate(['/profile', userId]);
    }
  }

  loadThread(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      post: this.postService.show(id),
      comments: this.commentService.list(id),
    }).subscribe({
      next: ({ post, comments }) => {
        this.post = post;
        this.comments = [...comments.data];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Nao foi possivel carregar a publicacao.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  publishComment(): void {
    if (!this.post || !this.commentContent.trim()) {
      this.toastService.warning('Atenção', 'Escreve um comentário antes de publicar.');
      return;
    }

    this.ngZone.run(() => {
      this.isCommenting = true;
    });

    this.commentService.create(this.post.id, this.commentContent.trim(), null).subscribe({
      next: (comment) => {
        this.ngZone.run(() => {
          this.comments = [...this.comments, comment];
          this.commentContent = '';
          this.post = {
            ...this.post!,
            comments_count: (this.post?.comments_count || 0) + 1
          };
          this.isCommenting = false;
          this.cdr.detectChanges();
        });
        this.toastService.success('Comentário adicionado!', 'O teu comentário foi publicado.');
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel comentar.';
          this.isCommenting = false;
          this.cdr.detectChanges();
        });
        this.toastService.error('Erro!', 'Não foi possível publicar o comentário.');
      }
    });
  }

  // Reply to comment
  startReply(comment: Comment, event: Event): void {
    event.stopPropagation();
    this.replyingToCommentId = comment.id;
    this.replyContent = '';
    this.cdr.detectChanges();
  }

  cancelReply(): void {
    this.replyingToCommentId = null;
    this.replyContent = '';
  }

  submitReply(comment: Comment): void {
    if (!this.replyContent.trim()) return;

    this.ngZone.run(() => {
      this.isReplying = true;
    });

    this.commentService.create(this.post!.id, this.replyContent.trim(), comment.id).subscribe({
      next: (newReply) => {
        this.ngZone.run(() => {
          this.comments = this.comments.map((item) =>
            item.id === comment.id
              ? { ...item, replies: [...(item.replies || []), newReply] }
              : item
          );
          if (this.post) {
            this.post = {
              ...this.post,
              comments_count: (this.post.comments_count || 0) + 1
            };
          }
          this.replyingToCommentId = null;
          this.replyContent = '';
          this.isReplying = false;
          this.cdr.detectChanges();
        });
        this.toastService.success('Resposta adicionada!', 'A tua resposta foi publicada.');
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel responder.';
          this.isReplying = false;
          this.cdr.detectChanges();
        });
        this.toastService.error('Erro!', 'Não foi possível responder.');
      }
    });
  }

  goBack(): void {
    window.history.back();
  }

  isOwnPost(): boolean {
    return !!this.post && this.authService.currentUser()?.id === this.post.user_id;
  }

  isOwnComment(comment: Comment): boolean {
    return this.authService.currentUser()?.id === comment.user_id;
  }

  // === POST MENU METHODS ===
  togglePostMenu(event: Event): void {
    event.stopPropagation();
    this.showPostMenu = !this.showPostMenu;
  }

  // === COMMENT MENU METHODS ===
  toggleCommentMenu(commentId: number, event: Event): void {
    event.stopPropagation();
    this.activeCommentMenuId = this.activeCommentMenuId === commentId ? null : commentId;
  }

  // === POST EDIT METHODS ===
  beginPostEdit(): void {
    if (!this.post) return;
    this.errorMessage = '';
    this.editingPost = true;
    this.editPostContent = this.post.content || '';
    this.showPostMenu = false;
  }

  cancelPostEdit(): void {
    this.editingPost = false;
    this.editPostContent = '';
  }

  savePost(): void {
    if (!this.post || !this.editPostContent.trim()) {
      this.toastService.warning('Atenção', 'A publicação precisa de texto para esta edição.');
      return;
    }

    this.postService.update(this.post.id, { content: this.editPostContent }).subscribe({
      next: (post) => {
        this.ngZone.run(() => {
          this.post = post;
          this.cancelPostEdit();
          this.cdr.detectChanges();
        });
        this.toastService.success('Editado!', 'Publicação atualizada com sucesso.');
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel editar a publicacao.';
          this.cdr.detectChanges();
        });
        this.toastService.error('Erro!', 'Não foi possível editar a publicação.');
      }
    });
  }

  // === POST DELETE METHODS ===
  confirmDeletePost(): void {
    this.showPostMenu = false;
    this.showDeletePostDialog = true;
  }

  cancelDeletePost(): void {
    this.showDeletePostDialog = false;
  }

  deletePostConfirmed(): void {
    if (!this.post) return;

    this.postService.delete(this.post.id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.router.navigate(['/home']);
        });
        this.toastService.success('Eliminado!', 'Publicação removida com sucesso.');
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel excluir a publicacao.';
          this.showDeletePostDialog = false;
          this.cdr.detectChanges();
        });
        this.toastService.error('Erro!', 'Não foi possível excluir a publicação.');
      }
    });
  }

  // === COMMENT EDIT METHODS ===
  beginCommentEdit(comment: Comment): void {
    this.errorMessage = '';
    this.editingCommentId = comment.id;
    this.editCommentContent = comment.content;
    this.activeCommentMenuId = null;
  }

  cancelCommentEdit(): void {
    this.editingCommentId = null;
    this.editCommentContent = '';
  }

  saveComment(comment: Comment): void {
    if (!this.editCommentContent.trim()) {
      this.toastService.warning('Atenção', 'O comentário precisa de texto.');
      return;
    }

    this.commentService.update(comment.id, this.editCommentContent.trim()).subscribe({
      next: (updatedComment) => {
        this.ngZone.run(() => {
          this.comments = this.comments.map((item) => item.id === comment.id ? updatedComment : item);
          this.cancelCommentEdit();
          this.cdr.detectChanges();
        });
        this.toastService.success('Editado!', 'Comentário atualizado com sucesso.');
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel editar o comentario.';
          this.cdr.detectChanges();
        });
        this.toastService.error('Erro!', 'Não foi possível editar o comentário.');
      }
    });
  }

  // === COMMENT DELETE METHODS ===
  confirmDeleteComment(comment: Comment): void {
    this.activeCommentMenuId = null;
    this.commentToDelete = comment;
    this.showDeleteCommentDialog = true;
  }

  cancelDeleteComment(): void {
    this.showDeleteCommentDialog = false;
    this.commentToDelete = null;
  }

  deleteCommentConfirmed(): void {
    if (!this.commentToDelete) return;

    this.commentService.delete(this.commentToDelete.id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.comments = this.comments.filter((item) => item.id !== this.commentToDelete?.id);
          if (this.post) {
            this.post = {
              ...this.post,
              comments_count: Math.max((this.post.comments_count || 1) - 1, 0)
            };
          }
          this.showDeleteCommentDialog = false;
          this.commentToDelete = null;
          this.cdr.detectChanges();
        });
        this.toastService.success('Eliminado!', 'Comentário removido com sucesso.');
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel excluir o comentario.';
          this.showDeleteCommentDialog = false;
          this.commentToDelete = null;
          this.cdr.detectChanges();
        });
        this.toastService.error('Erro!', 'Não foi possível excluir o comentário.');
      }
    });
  }

  // === BAZE WITH ANIMATION ===
  toggleBaze(event: MouseEvent): void {
    if (!this.post) return;

    const burst = document.createElement('div');
    burst.className = 'baze-burst';
    burst.innerHTML = '❤️';
    burst.style.left = (event.clientX - 15) + 'px';
    burst.style.top = (event.clientY - 15) + 'px';
    document.body.appendChild(burst);

    setTimeout(() => {
      burst.remove();
    }, 500);

    this.isBazing = true;
    setTimeout(() => {
      this.isBazing = false;
    }, 300);

    const nextHasBazed = !this.post.has_bazed;
    const nextCount = Math.max((this.post.bazes_count || 0) + (nextHasBazed ? 1 : -1), 0);

    const previousState = { ...this.post };
    this.post = { ...this.post, has_bazed: nextHasBazed, bazes_count: nextCount };

    const request = nextHasBazed
      ? this.postService.addBaze(this.post.id)
      : this.postService.removeBaze(this.post.id);

    request.subscribe({
      error: () => {
        this.post = previousState;
        this.toastService.warning('Erro!', 'Não foi possível atualizar o baze.');
      }
    });
  }

  // === UTILITY METHODS ===
  initials(name?: string): string {
    return name ? name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2) : '?';
  }

  username(name?: string): string {
    return (name || 'utilizador').toLowerCase().replace(/\s+/g, '_');
  }

  mediaUrl(path?: string | null): string | null {
    return this.apiUrl.storageUrl(path);
  }

  relativeTime(date?: string): string {
    if (!date) return 'agora';
    const minutes = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`;
  }
}