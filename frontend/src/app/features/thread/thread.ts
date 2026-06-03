import { Component, OnInit, ChangeDetectorRef, ApplicationRef, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Comment, Post } from '../../core/models/api.models';
import { ApiUrlService } from '../../core/services/api-url.service';
import { AuthService } from '../../core/services/auth.service';
import { CommentService } from '../../core/services/comment.service';
import { PostService } from '../../core/services/post.service';

@Component({
  selector: 'nzola-thread',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './thread.html',
  styleUrls: ['./thread.scss'],
  host: { class: 'block w-full' }
})
export class ThreadComponent implements OnInit {
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
  
  // Dialog properties
  showDeletePostDialog = false;
  showDeleteCommentDialog = false;
  commentToDelete: Comment | null = null;
  
  // Baze animation
  isBazing = false;

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
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage = 'Publicacao invalida.';
      return;
    }

    this.loadThread(id);
  }

  // Fechar menus ao clicar fora
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-trigger') && !target.closest('.comment-menu-trigger')) {
      this.showPostMenu = false;
      this.activeCommentMenuId = null;
    }
  }

  loadThread(id: number): void {
    this.ngZone.run(() => {
      this.isLoading = true;
      this.errorMessage = '';
    });

    this.postService.show(id).subscribe({
      next: (post) => {
        this.ngZone.run(() => {
          this.post = post;
          this.cdr.detectChanges();
          this.loadComments(post.id);
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel carregar a publicacao.';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  loadComments(postId: number): void {
    this.commentService.list(postId).subscribe({
      next: (page) => {
        this.ngZone.run(() => {
          this.comments = [...page.data];
          this.isLoading = false;
          this.cdr.detectChanges();
          this.appRef.tick();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Erro ao carregar comentários:', error);
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  publishComment(): void {
    if (!this.post || !this.commentContent.trim()) {
      return;
    }

    this.ngZone.run(() => {
      this.isCommenting = true;
    });

    this.commentService.create(this.post.id, this.commentContent.trim()).subscribe({
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
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel comentar.';
          this.isCommenting = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
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
    if (!this.post || !this.editPostContent.trim()) return;

    this.postService.update(this.post.id, { content: this.editPostContent }).subscribe({
      next: (post) => {
        this.ngZone.run(() => {
          this.post = post;
          this.cancelPostEdit();
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel editar a publicacao.';
          this.cdr.detectChanges();
        });
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
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel excluir a publicacao.';
          this.showDeletePostDialog = false;
          this.cdr.detectChanges();
        });
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
    if (!this.editCommentContent.trim()) return;

    this.commentService.update(comment.id, this.editCommentContent.trim()).subscribe({
      next: (updatedComment) => {
        this.ngZone.run(() => {
          this.comments = this.comments.map((item) => item.id === comment.id ? updatedComment : item);
          this.cancelCommentEdit();
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel editar o comentario.';
          this.cdr.detectChanges();
        });
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
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel excluir o comentario.';
          this.showDeleteCommentDialog = false;
          this.commentToDelete = null;
          this.cdr.detectChanges();
        });
      }
    });
  }

  // === BAZE WITH ANIMATION ===
  toggleBaze(event: MouseEvent): void {
    if (!this.post) return;
    
    // Criar elemento de animação
    const burst = document.createElement('div');
    burst.className = 'baze-burst';
    burst.innerHTML = '❤️';
    burst.style.left = (event.clientX - 15) + 'px';
    burst.style.top = (event.clientY - 15) + 'px';
    document.body.appendChild(burst);
    
    setTimeout(() => {
      burst.remove();
    }, 500);
    
    // Adicionar classe de animação ao botão
    this.isBazing = true;
    setTimeout(() => {
      this.isBazing = false;
    }, 300);
    
    // Chamar o serviço de baze
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