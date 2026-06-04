import { Component, OnInit, ChangeDetectorRef, ApplicationRef, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Post } from '../../core/models/api.models';
import { ApiUrlService } from '../../core/services/api-url.service';
import { PostService } from '../../core/services/post.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';

@Component({
  selector: 'nzola-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonComponent],
  templateUrl: './feed.html',
  styleUrls: ['./feed.scss'],
  host: { class: 'block w-full' }
})
export class FeedComponent implements OnInit {
  posts: Post[] = [];
  isLoading = false;
  errorMessage = '';
  actionMessage = '';
  editingPostId: number | null = null;
  editContent = '';
  
  activeMenuId: number | null = null;
  showConfirmDialog = false;
  postToDelete: Post | null = null;

  skeletonItems = [1, 2, 3];

  constructor(
    private postService: PostService,
    private apiUrl: ApiUrlService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private appRef: ApplicationRef,
    private ngZone: NgZone,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadFeed();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-trigger') && !target.closest('.post-menu-dropdown') && !target.closest('.edit-textarea')) {
      if (this.editingPostId) {
        this.cancelEdit();
      }
      this.activeMenuId = null;
    }
  }

  // Navegar para o perfil do utilizador
  goToUserProfile(userId: number | undefined, event: Event): void {
    event.stopPropagation();
    if (userId) {
      this.router.navigate(['/profile', userId]);
    }
  }

  loadFeed(): void {
    this.ngZone.run(() => {
      this.isLoading = true;
      this.errorMessage = '';
    });

    this.postService.list().subscribe({
      next: (page) => {
        this.ngZone.run(() => {
          this.posts = [...page.data];
          this.isLoading = false;
          this.cdr.detectChanges();
          this.appRef.tick();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Não foi possível carregar o feed.';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
        this.toastService.error('Erro!', 'Não foi possível carregar o feed.');
      }
    });
  }

  initials(name?: string): string {
    if (!name) return '?';
    return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
  }

  username(name?: string): string {
    return (name || 'utilizador').toLowerCase().replace(/\s+/g, '_');
  }

  mediaUrl(path?: string | null): string | null {
    return this.apiUrl.storageUrl(path);
  }

  goToThread(post: Post): void {
    this.router.navigate(['/post', post.id]);
  }

  isOwnPost(post: Post): boolean {
    return this.authService.currentUser()?.id === post.user_id;
  }

  toggleMenu(postId: number, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeMenuId = this.activeMenuId === postId ? null : postId;
  }

  beginEdit(post: Post): void {
    this.actionMessage = '';
    this.editingPostId = post.id;
    this.editContent = post.content || '';
    this.activeMenuId = null;
  }

  cancelEdit(): void {
    this.editingPostId = null;
    this.editContent = '';
  }

  savePost(post: Post): void {
    if (this.editingPostId !== post.id) {
      return;
    }

    if (!this.editContent.trim()) {
      this.toastService.warning('Atenção', 'A publicação precisa de texto para esta edição.');
      return;
    }

    this.postService.update(post.id, { content: this.editContent }).subscribe({
      next: (updatedPost) => {
        this.posts = this.posts.map((item) => 
          item.id === post.id ? { ...updatedPost, has_bazed: item.has_bazed, bazes_count: item.bazes_count } : item
        );
        this.cancelEdit();
        this.toastService.success('Editado!', 'Publicação atualizada com sucesso.');
        this.cdr.detectChanges();
      },
      error: (error) => {
        const msg = error?.error?.message || 'Não foi possível editar a publicação.';
        this.toastService.error('Erro!', msg);
        this.actionMessage = msg;
      }
    });
  }

  confirmDelete(post: Post): void {
    this.postToDelete = post;
    this.showConfirmDialog = true;
    this.activeMenuId = null;
  }

  cancelDelete(): void {
    this.showConfirmDialog = false;
    this.postToDelete = null;
  }

  deletePost(): void {
    if (!this.postToDelete) return;

    this.postService.delete(this.postToDelete.id).subscribe({
      next: () => {
        this.posts = this.posts.filter((item) => item.id !== this.postToDelete?.id);
        this.showConfirmDialog = false;
        this.postToDelete = null;
        this.toastService.success('Eliminado!', 'Publicação removida com sucesso.');
      },
      error: (error) => {
        const msg = error?.error?.message || 'Não foi possível excluir a publicação.';
        this.toastService.error('Erro!', msg);
        this.actionMessage = msg;
        this.showConfirmDialog = false;
        this.postToDelete = null;
      }
    });
  }

  toggleBaze(post: Post, event?: Event): void {
    if (event) event.stopPropagation();
    
    const nextHasBazed = !post.has_bazed;
    const nextCount = Math.max((post.bazes_count || 0) + (nextHasBazed ? 1 : -1), 0);

    const originalPost = { ...post };
    this.posts = this.posts.map((item) =>
      item.id === post.id ? { ...item, has_bazed: nextHasBazed, bazes_count: nextCount } : item
    );

    const request = nextHasBazed
      ? this.postService.addBaze(post.id)
      : this.postService.removeBaze(post.id);

    request.subscribe({
      error: () => {
        this.posts = this.posts.map((item) =>
          item.id === post.id ? originalPost : item
        );
        this.toastService.warning('Erro!', 'Não foi possível atualizar o baze.');
      }
    });
  }

  relativeTime(date?: string): string {
    if (!date) return 'agora';
    const diffMs = Date.now() - new Date(date).getTime();
    const minutes = Math.max(1, Math.floor(diffMs / 60000));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.error('Erro ao carregar imagem:', img.src);
  }
}