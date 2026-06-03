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
  
  // Menu properties
  activeMenuId: number | null = null;
  
  // Confirm dialog
  showConfirmDialog = false;
  postToDelete: Post | null = null;

  waveform: number[] = [
    6, 10, 16, 22, 18, 28, 12, 20, 26, 14,
    8, 24, 20, 30, 16, 10, 28, 22, 18, 12,
    26, 8, 20, 14, 30, 18, 10, 24, 16, 22,
  ];

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
    console.log('🔵 FeedComponent inicializado');
    this.loadFeed();
  }

  // Fechar menu ao clicar fora
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-trigger') && !target.closest('.menu-dropdown')) {
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
    return this.apiUrl.storageUrl(path);
  }

  // Navegar para a thread
  goToThread(post: Post): void {
    this.router.navigate(['/post', post.id]);
  }

  isOwnPost(post: Post): boolean {
    return this.authService.currentUser()?.id === post.user_id;
  }

  // === MENU METHODS ===
  toggleMenu(postId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.activeMenuId = this.activeMenuId === postId ? null : postId;
  }

  closeMenu(): void {
    this.activeMenuId = null;
  }

  // === EDIT METHODS ===
  beginEdit(post: Post): void {
    this.actionMessage = '';
    this.editingPostId = post.id;
    this.editContent = post.content || '';
    this.closeMenu();
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

  // === DELETE METHODS ===
  confirmDelete(post: Post): void {
    this.postToDelete = post;
    this.showConfirmDialog = true;
    this.closeMenu();
  }

  cancelDelete(): void {
    this.showConfirmDialog = false;
    this.postToDelete = null;
  }

  deletePost(): void {
    if (!this.postToDelete) return;

    this.actionMessage = '';
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

  // === BAZE METHODS ===
  toggleBaze(post: Post, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    this.actionMessage = '';
    const nextHasBazed = !post.has_bazed;
    const nextCount = Math.max((post.bazes_count || 0) + (nextHasBazed ? 1 : -1), 0);

    this.posts = this.posts.map((item) =>
      item.id === post.id
        ? { ...item, has_bazed: nextHasBazed, bazes_count: nextCount }
        : item
    );

    const request = nextHasBazed
      ? this.postService.addBaze(post.id)
      : this.postService.removeBaze(post.id);

    request.subscribe({
      error: (error) => {
        this.posts = this.posts.map((item) =>
          item.id === post.id
            ? { ...item, has_bazed: post.has_bazed, bazes_count: post.bazes_count }
            : item
        );
        this.actionMessage = error?.error?.message || 'Não foi possível atualizar o baze.';
      }
    });
  }

  // === UTILITY METHODS ===
  relativeTime(date?: string): string {
    if (!date) return 'agora';
    const diffMs = Date.now() - new Date(date).getTime();
    const minutes = Math.max(1, Math.floor(diffMs / 60000));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }
}