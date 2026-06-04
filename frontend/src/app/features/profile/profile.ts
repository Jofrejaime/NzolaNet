import { Component, OnInit, inject, ChangeDetectorRef, ApplicationRef, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AvatarComponent } from '../../shared/components/avatar/avatar';
import { Post, NzolaUser } from '../../core/models/api.models';
import { ApiUrlService } from '../../core/services/api-url.service';
import { AuthService } from '../../core/services/auth.service';
import { PostService } from '../../core/services/post.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'nzola-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private postService = inject(PostService);
  private userService = inject(UserService);
  apiUrl = inject(ApiUrlService);
  private cdr = inject(ChangeDetectorRef);
  private appRef = inject(ApplicationRef);
  private ngZone = inject(NgZone);

  activeTab: 'posts' | 'replies' | 'highlights' | 'media' = 'posts';
  user: NzolaUser | null = null;
  posts: Post[] = [];
  isLoading = false;
  errorMessage = '';
  
  followersCount = 0;
  followingCount = 0;
  
  // Para controle de menu (apenas no próprio perfil)
  activeMenuId: number | null = null;
  editingPostId: number | null = null;
  editContent = '';
  showConfirmDialog = false;
  postToDelete: Post | null = null;
  
  // Indica se é o próprio perfil
  isOwnProfile = false;

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    
    if (userId) {
      // Ver página de perfil de outro utilizador
      this.loadUserProfile(Number(userId));
      this.isOwnProfile = this.authService.currentUser()?.id === Number(userId);
    } else {
      // Página do próprio perfil
      this.loadOwnProfile();
      this.isOwnProfile = true;
    }
  }

  loadOwnProfile(): void {
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
          this.loadFollowersCount(user.id);
          this.loadFollowingCount(user.id);
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Não foi possível carregar o perfil.';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  loadUserProfile(userId: number): void {
    this.ngZone.run(() => {
      this.isLoading = true;
      this.errorMessage = '';
    });

    this.userService.show(userId).subscribe({
      next: (user) => {
        this.ngZone.run(() => {
          this.user = user;
          this.cdr.detectChanges();
          this.loadPosts(user.id);
          this.loadFollowersCount(user.id);
          this.loadFollowingCount(user.id);
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Não foi possível carregar o perfil.';
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
          this.errorMessage = error?.error?.message || 'Não foi possível carregar as publicações.';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  loadFollowersCount(userId: number): void {
    this.userService.getFollowers(userId).subscribe({
      next: (data: any) => {
        this.followersCount = data.length || 0;
        this.cdr.detectChanges();
      },
      error: (error: any) => console.error('Erro ao carregar seguidores:', error)
    });
  }

  loadFollowingCount(userId: number): void {
    this.userService.getFollowing(userId).subscribe({
      next: (data: any) => {
        this.followingCount = data.length || 0;
        this.cdr.detectChanges();
      },
      error: (error: any) => console.error('Erro ao carregar seguindo:', error)
    });
  }

  goToFollowers(): void {
    this.router.navigate(['/profile', this.user?.id, 'followers']);
  }

  goToFollowing(): void {
    this.router.navigate(['/profile', this.user?.id, 'following']);
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

  followUser(): void {
    if (!this.user) return;
    this.userService.follow(this.user.id).subscribe({
      next: () => {
        // Atualizar estado
      },
      error: (error) => console.error('Erro ao seguir:', error)
    });
  }

  unfollowUser(): void {
    if (!this.user) return;
    this.userService.unfollow(this.user.id).subscribe({
      next: () => {
        // Atualizar estado
      },
      error: (error) => console.error('Erro ao deixar de seguir:', error)
    });
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

  initials(name?: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  // === MENU METHODS (apenas para próprio perfil) ===
  toggleMenu(postId: number, event: Event): void {
    if (!this.isOwnProfile) return;
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === postId ? null : postId;
  }

  beginEdit(post: Post): void {
    if (!this.isOwnProfile) return;
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
          this.errorMessage = error?.error?.message || 'Não foi possível editar o post.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  confirmDelete(post: Post): void {
    if (!this.isOwnProfile) return;
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
          this.errorMessage = error?.error?.message || 'Não foi possível excluir o post.';
          this.showConfirmDialog = false;
          this.postToDelete = null;
          this.cdr.detectChanges();
        });
      }
    });
  }

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