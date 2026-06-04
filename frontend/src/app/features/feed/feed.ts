import { Component, OnInit, ChangeDetectorRef, ApplicationRef, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Post } from '../../core/models/api.models';
import { ApiUrlService } from '../../core/services/api-url.service';
import { PostService } from '../../core/services/post.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'nzola-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(
    private postService: PostService,
    private apiUrl: ApiUrlService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private appRef: ApplicationRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadFeed();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-trigger')) {
      this.activeMenuId = null;
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
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Não foi possível carregar o feed.';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
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
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('posts/')) {
    return `http://localhost:8000/storage/${path}`;
  }
  return `http://localhost:8000/storage/${path}`;
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
    if (!this.editContent.trim()) {
      this.actionMessage = 'A publicação precisa de texto para esta edição.';
      return;
    }

    this.postService.update(post.id, { content: this.editContent }).subscribe({
      next: (updatedPost) => {
        this.posts = this.posts.map((item) => item.id === post.id ? updatedPost : item);
        this.cancelEdit();
      },
      error: (error) => {
        this.actionMessage = error?.error?.message || 'Não foi possível editar a publicação.';
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
      },
      error: (error) => {
        this.actionMessage = error?.error?.message || 'Não foi possível excluir a publicação.';
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
  // Adicionar este método no FeedComponent
onImageError(imagePath: string): void {
  console.error('Erro ao carregar imagem:', imagePath);
  console.log('URL gerado:', this.mediaUrl(imagePath));
}
}