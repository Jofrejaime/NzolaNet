import { Component, OnInit, inject, ChangeDetectorRef, ApplicationRef, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AvatarComponent } from '../../shared/components/avatar/avatar';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';
import { Post, NzolaUser } from '../../core/models/api.models';
import { ApiUrlService } from '../../core/services/api-url.service';
import { AuthService } from '../../core/services/auth.service';
import { PostService } from '../../core/services/post.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'nzola-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarComponent, SkeletonComponent],
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
  private toastService = inject(ToastService);

  activeTab: 'posts' | 'replies' | 'highlights' | 'media' = 'posts';
  user: NzolaUser | null = null;
  posts: Post[] = [];
  isLoading = false;
  errorMessage = '';
  
  followersCount = 0;
  followingCount = 0;
  
  activeMenuId: number | null = null;
  editingPostId: number | null = null;
  editContent = '';
  showConfirmDialog = false;
  postToDelete: Post | null = null;
  
  isOwnProfile = false;
  skeletonItems = [1, 2, 3];

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    
    if (userId) {
      this.loadUserProfile(Number(userId));
      this.isOwnProfile = this.authService.currentUser()?.id === Number(userId);
    } else {
      this.loadOwnProfile();
      this.isOwnProfile = true;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-trigger') && !target.closest('.edit-textarea')) {
      if (this.editingPostId) {
        this.cancelEdit();
      }
      this.activeMenuId = null;
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
        this.toastService.error('Erro!', 'Não foi possível carregar o perfil.');
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
        this.toastService.error('Erro!', 'Não foi possível carregar o perfil.');
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
        this.toastService.error('Erro!', 'Não foi possível carregar as publicações.');
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
        this.toastService.success('Seguindo!', `Agora segues ${this.user?.name}.`);
      },
      error: (error) => {
        this.toastService.error('Erro!', 'Não foi possível seguir este utilizador.');
      }
    });
  }

  unfollowUser(): void {
    if (!this.user) return;
    this.userService.unfollow(this.user.id).subscribe({
      next: () => {
        this.toastService.info('Deixaste de seguir', `${this.user?.name}.`);
      },
      error: (error) => {
        this.toastService.error('Erro!', 'Não foi possível deixar de seguir.');
      }
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
    if (this.editingPostId !== post.id) return;
    
    if (!this.editContent.trim()) {
      this.toastService.warning('Atenção', 'A publicação precisa de texto para esta edição.');
      return;
    }

    this.postService.update(post.id, { content: this.editContent }).subscribe({
      next: (updatedPost) => {
        this.ngZone.run(() => {
          this.posts = this.posts.map(p => p.id === post.id ? updatedPost : p);
          this.cancelEdit();
          this.cdr.detectChanges();
        });
        this.toastService.success('Editado!', 'Publicação atualizada com sucesso.');
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Não foi possível editar o post.';
          this.cdr.detectChanges();
        });
        this.toastService.error('Erro!', 'Não foi possível editar a publicação.');
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
        this.toastService.success('Eliminado!', 'Publicação removida com sucesso.');
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Não foi possível excluir o post.';
          this.showConfirmDialog = false;
          this.postToDelete = null;
          this.cdr.detectChanges();
        });
        this.toastService.error('Erro!', 'Não foi possível excluir a publicação.');
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
        this.toastService.warning('Erro!', 'Não foi possível atualizar o baze.');
      }
    });
  }
}