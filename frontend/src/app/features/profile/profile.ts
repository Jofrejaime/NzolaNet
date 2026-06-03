import { Component, OnInit, inject, ChangeDetectorRef, ApplicationRef, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarComponent } from '../../shared/components/avatar/avatar';
import { Router, RouterLink } from '@angular/router';
import { Post, NzolaUser } from '../../core/models/api.models';
import { ApiUrlService } from '../../core/services/api-url.service';
import { AuthService } from '../../core/services/auth.service';
import { PostService } from '../../core/services/post.service';

@Component({
  selector: 'nzola-profile',
  standalone: true,
  imports: [CommonModule, AvatarComponent, RouterLink, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private postService = inject(PostService);
  private apiUrl = inject(ApiUrlService);
  private cdr = inject(ChangeDetectorRef);
  private appRef = inject(ApplicationRef);
  private ngZone = inject(NgZone);

  activeTab: 'posts' | 'replies' | 'highlights' | 'media' = 'posts';
  user: NzolaUser | null = this.authService.currentUser();
  posts: Post[] = [];
  isLoading = false;
  errorMessage = '';
  
  // Menu properties
  activeMenuId: number | null = null;
  editingPostId: number | null = null;
  editContent = '';
  
  // Dialog properties
  showConfirmDialog = false;
  postToDelete: Post | null = null;

  ngOnInit(): void {
    this.loadProfile();
  }

  // Fechar menu ao clicar fora
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-trigger')) {
      this.activeMenuId = null;
    }
  }

  loadProfile(): void {
    this.ngZone.run(() => {
      this.isLoading = true;
      this.errorMessage = '';
    });

    this.authService.loadUser().subscribe({
      next: (user) => {
        this.ngZone.run(() => {
          this.user = user;
          this.cdr.detectChanges();
          this.loadPosts(user.id);
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel carregar o perfil.';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  loadPosts(userId: number): void {
    this.postService.list().subscribe({
      next: (page) => {
        this.ngZone.run(() => {
          this.posts = [...page.data.filter((post) => post.user_id === userId)];
          this.isLoading = false;
          this.cdr.detectChanges();
          this.appRef.tick();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel carregar as publicacoes.';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }
 // Adicionar este método na classe ProfileComponent
initials(name?: string): string {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
  goToAccount(): void {
    this.router.navigate(['/settings/account']);
  }
  

  goBack(): void {
    this.router.navigate(['/']);
  }

  goToThread(post: Post): void {
    this.router.navigate(['/post', post.id]);
  }

  photoUrl(path?: string | null): string | null {
    return this.apiUrl.storageUrl(path);
  }

  mediaUrl(path?: string | null): string | null {
    return this.apiUrl.storageUrl(path);
  }

  username(): string {
    return (this.user?.name || 'utilizador').toLowerCase().replace(/\s+/g, '_');
  }

  relativeTime(date?: string): string {
    if (!date) return 'agora';
    const minutes = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`;
  }

  isOwnProfile(): boolean {
    return true; // Este é o perfil do próprio utilizador
  }

  // === MENU METHODS ===
  toggleMenu(postId: number, event: Event): void {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === postId ? null : postId;
  }

  // === EDIT METHODS ===
  beginEdit(post: Post): void {
    this.editingPostId = post.id;
    this.editContent = post.content || '';
    this.activeMenuId = null;
  }

  cancelEdit(): void {
    this.editingPostId = null;
    this.editContent = '';
  }

  savePost(post: Post): void {
    if (!this.editContent.trim()) return;

    this.postService.update(post.id, { content: this.editContent }).subscribe({
      next: (updatedPost) => {
        this.ngZone.run(() => {
          this.posts = this.posts.map(p => p.id === post.id ? updatedPost : p);
          this.cancelEdit();
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel editar o post.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  // === DELETE METHODS ===
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
        this.ngZone.run(() => {
          this.posts = this.posts.filter(p => p.id !== this.postToDelete?.id);
          this.showConfirmDialog = false;
          this.postToDelete = null;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel excluir o post.';
          this.showConfirmDialog = false;
          this.postToDelete = null;
          this.cdr.detectChanges();
        });
      }
    });
  }

  // === BAZE METHODS ===
  toggleBaze(post: Post, event: Event): void {
    event.stopPropagation();
    
    const nextHasBazed = !post.has_bazed;
    const nextCount = Math.max((post.bazes_count || 0) + (nextHasBazed ? 1 : -1), 0);
    
    const previousPosts = [...this.posts];
    this.posts = this.posts.map(p =>
      p.id === post.id ? { ...p, has_bazed: nextHasBazed, bazes_count: nextCount } : p
    );
    
    const request = nextHasBazed
      ? this.postService.addBaze(post.id)
      : this.postService.removeBaze(post.id);
    
    request.subscribe({
      error: () => {
        this.posts = previousPosts;
      }
    });
  }
}