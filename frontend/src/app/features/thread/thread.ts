import { Component, OnInit, ChangeDetectorRef, ApplicationRef, NgZone } from '@angular/core';
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

  beginPostEdit(): void {
    if (!this.post) {
      return;
    }

    this.errorMessage = '';
    this.editingPost = true;
    this.editPostContent = this.post.content || '';
  }

  cancelPostEdit(): void {
    this.editingPost = false;
    this.editPostContent = '';
  }

  savePost(): void {
    if (!this.post || !this.editPostContent.trim()) {
      return;
    }

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

  deletePost(): void {
    if (!this.post || !confirm('Excluir esta publicacao?')) {
      return;
    }

    this.postService.delete(this.post.id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.router.navigate(['/home']);
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel excluir a publicacao.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  beginCommentEdit(comment: Comment): void {
    this.errorMessage = '';
    this.editingCommentId = comment.id;
    this.editCommentContent = comment.content;
  }

  cancelCommentEdit(): void {
    this.editingCommentId = null;
    this.editCommentContent = '';
  }

  saveComment(comment: Comment): void {
    if (!this.editCommentContent.trim()) {
      return;
    }

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

  deleteComment(comment: Comment): void {
    if (!confirm('Excluir este comentario?')) {
      return;
    }

    this.commentService.delete(comment.id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.comments = this.comments.filter((item) => item.id !== comment.id);
          if (this.post) {
            this.post = {
              ...this.post,
              comments_count: Math.max((this.post.comments_count || 1) - 1, 0)
            };
          }
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel excluir o comentario.';
          this.cdr.detectChanges();
        });
      }
    });
  }

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
    if (!date) {
      return 'agora';
    }

    const minutes = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 60000));

    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    return hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`;
  }
}