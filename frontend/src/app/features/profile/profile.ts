import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { AvatarComponent } from '../../shared/components/avatar/avatar';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';
import { MediaGalleryComponent } from '../../shared/components/media-gallery/media-gallery';
import { Comment, Post, PostMedia, NzolaUser } from '../../core/models/api.models';
import { ApiUrlService } from '../../core/services/api-url.service';
import { AuthService } from '../../core/services/auth.service';
import { PostService } from '../../core/services/post.service';
import { UserService } from '../../core/services/user.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { ReportService } from '../../core/services/report.service';
import { ToastService } from '../../core/services/toast.service';

interface EditMediaFile { type: 'image' | 'video'; file: File; preview: string; }

function getPostMedia(post: Post): PostMedia[] {
  if (post.media?.length) return post.media;
  const items: PostMedia[] = [];
  if (post.image) items.push({ type: 'image', path: post.image });
  if (post.video) items.push({ type: 'video', path: post.video });
  return items;
}

@Component({
  selector: 'nzola-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarComponent, SkeletonComponent, MediaGalleryComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private postService = inject(PostService);
  private userService = inject(UserService);
  private realtimeService = inject(RealtimeService);
  private reportService = inject(ReportService);
  apiUrl = inject(ApiUrlService);
  private cdr = inject(ChangeDetectorRef);
  private toastService = inject(ToastService);

  private realtimeBazeSub?: Subscription;
  private realtimePostDeletedSub?: Subscription;

  activeTab: 'posts' | 'replies' | 'media' = 'posts';
  user: NzolaUser | null = null;
  posts: Post[] = [];
  userComments: Comment[] = [];
  isLoadingProfile = false;
  isLoadingPosts = false;
  isLoadingTab = false;
  errorMessage = '';
  
  followersCount = 0;
  followingCount = 0;
  
  activeMenuId: number | null = null;
  editingPostId: number | null = null;
  editContent = '';
  editMediaItems: PostMedia[] = [];
  editNewFiles: EditMediaFile[] = [];
  readonly MAX_EDIT_MEDIA = 4;

  get editTotalMedia(): number { return this.editMediaItems.length + this.editNewFiles.length; }
  get canAddEditMedia(): boolean { return this.editTotalMedia < this.MAX_EDIT_MEDIA; }

  getPostMedia = getPostMedia;

  showConfirmDialog = false;
  postToDelete: Post | null = null;

  showReportModal = false;
  reportTarget: Post | null = null;
  reportReason = 'inappropriate';
  reportDescription = '';
  reportLoading = false;

  isOwnProfile = false;
  skeletonItems = [1, 2, 3];

  ngOnInit(): void {
    // ESCUTAR MUDANÇAS nos parâmetros da rota (IMPORTANTE!)
    this.route.paramMap.subscribe(params => {
      const userId = params.get('id');
      
      if (userId) {
        this.loadUserProfile(Number(userId));
        this.isOwnProfile = this.authService.currentUser()?.id === Number(userId);
      } else {
        this.loadOwnProfile();
        this.isOwnProfile = true;
      }
    });

    this.listenForRealtimeBazes();
    this.listenForDeletedPosts();
    this.realtimeService.connectToPublicChannels();
  }

  ngOnDestroy(): void {
    this.realtimeBazeSub?.unsubscribe();
    this.realtimePostDeletedSub?.unsubscribe();
  }

  private listenForRealtimeBazes(): void {
    this.realtimeBazeSub = this.realtimeService.postBazeUpdates$.subscribe((update) => {
      this.posts = this.posts.map((post) =>
        post.id === update.post_id ? { ...post, bazes_count: update.bazes_count } : post
      );
      this.cdr.detectChanges();
    });
  }

  private listenForDeletedPosts(): void {
    this.realtimePostDeletedSub = this.realtimeService.postDeleted$.subscribe(({ post_id }) => {
      this.posts = this.posts.filter(p => p.id !== post_id);
      this.cdr.detectChanges();
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-trigger') && !target.closest('.post-menu-dropdown') && !target.closest('.edit-textarea') && !target.closest('.edit-media-form')) {
      if (this.editingPostId) {
        this.cancelEdit();
      }
      this.activeMenuId = null;
    }
  }

  loadOwnProfile(): void {
    this.isLoadingProfile = true;
    this.errorMessage = '';
    // Limpar dados anteriores
    this.posts = [];
    this.userComments = [];
    this.user = null;
    this.followersCount = 0;
    this.followingCount = 0;

    this.authService.loadUser().subscribe({
      next: (user) => {
        this.user = user;
        this.isLoadingProfile = false;
        this.loadProfileStats(user.id);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Não foi possível carregar o perfil.';
        this.isLoadingProfile = false;
        this.toastService.error('Erro!', 'Não foi possível carregar o perfil.');
      },
    });
  }

  loadUserProfile(userId: number): void {
    this.isLoadingProfile = true;
    this.errorMessage = '';
    // Limpar dados anteriores
    this.posts = [];
    this.userComments = [];
    this.user = null;
    this.followersCount = 0;
    this.followingCount = 0;

    this.userService.show(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.isLoadingProfile = false;
        this.loadProfileStats(user.id);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Não foi possível carregar o perfil.';
        this.isLoadingProfile = false;
        this.toastService.error('Erro!', 'Não foi possível carregar o perfil.');
      },
    });
  }

  private loadProfileStats(userId: number): void {
    this.isLoadingPosts = true;

    forkJoin({
      posts: this.userService.getUserPosts(userId),
      followers: this.userService.getFollowers(userId),
      following: this.userService.getFollowing(userId),
    }).subscribe({
      next: ({ posts, followers, following }) => {
        this.posts = [...posts.data];
        this.followersCount = followers.length;
        this.followingCount = following.length;
        this.isLoadingPosts = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingPosts = false;
        this.errorMessage = 'Não foi possível carregar os dados do perfil.';
        this.toastService.error('Erro!', 'Não foi possível carregar as publicações.');
      },
    });
  }

  get canSeeContent(): boolean {
    if (!this.user) return false;
    return !this.user.is_private || !!this.user.is_following || this.isOwnProfile;
  }

  get mediaPosts(): Post[] {
    return this.posts.filter((post) => !!post.image || !!post.video);
  }

  setTab(tab: 'posts' | 'replies' | 'media'): void {
    this.activeTab = tab;
    if (!this.user) return;
    if (tab === 'replies' && this.userComments.length === 0) {
      this.loadUserComments(this.user.id);
    }
  }

  loadUserComments(userId: number): void {
    this.isLoadingTab = true;
    this.userService.getUserComments(userId).subscribe({
      next: (page) => {
        this.userComments = [...page.data];
        this.isLoadingTab = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingTab = false;
        this.toastService.error('Erro!', 'Não foi possível carregar as respostas.');
      },
    });
  }

  goToFollowers(): void {
    const id = this.user?.id;
    if (!id) return;
    // Sempre passa o ID para a navegação
    this.router.navigate(['/profile', id, 'followers']);
  }

  goToFollowing(): void {
    const id = this.user?.id;
    if (!id) return;
    // Sempre passa o ID para a navegação
    this.router.navigate(['/profile', id, 'following']);
  }

  goToAccount(): void {
    this.router.navigate(['/settings/account']);
  }

  goBack(): void {
    window.history.back();
  }

  goToThread(post: Post): void {
    this.router.navigate(['/post', post.id]);
  }

  goToCommentPost(comment: Comment): void {
    if (comment.post_id) {
      this.router.navigate(['/post', comment.post_id]);
    }
  }

  toggleFollow(): void {
    if (!this.user) return;
    
    const isCurrentlyFollowingOrPending = this.user.is_following || this.user.is_follow_pending;
    
    const request = isCurrentlyFollowingOrPending
      ? this.userService.unfollow(this.user.id)
      : this.userService.follow(this.user.id);

    request.subscribe({
      next: () => {
        if (isCurrentlyFollowingOrPending) {
          // Unfollowed or cancelled request
          this.user = { ...this.user!, is_following: false, is_follow_pending: false };
          this.toastService.success('Deixaste de seguir ou cancelaste o pedido.', this.user.name || '');
        } else {
          // Followed or requested
          if (this.user?.is_private) {
            this.user = { ...this.user!, is_follow_pending: true };
            this.toastService.success('Pedido enviado!', 'Aguarde a aprovação.');
          } else {
            this.user = { ...this.user!, is_following: true };
            this.toastService.success('Seguindo!', this.user.name || '');
          }
        }
        this.cdr.detectChanges();
      },
      error: () => this.toastService.error('Erro!', 'Não foi possível actualizar o seguimento.'),
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
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === postId ? null : postId;
  }

  beginEdit(post: Post): void {
    this.editingPostId = post.id;
    this.editContent = post.content || '';
    this.editMediaItems = getPostMedia(post);
    this.editNewFiles = [];
    this.activeMenuId = null;
  }

  cancelEdit(): void {
    this.editingPostId = null;
    this.editContent = '';
    this.editMediaItems = [];
    this.editNewFiles = [];
  }

  removeEditMedia(index: number): void {
    this.editMediaItems = this.editMediaItems.filter((_, i) => i !== index);
  }

  removeEditNewFile(index: number): void {
    this.editNewFiles = this.editNewFiles.filter((_, i) => i !== index);
  }

  onEditMediaSelected(event: Event, type: 'image' | 'video'): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const remaining = this.MAX_EDIT_MEDIA - this.editTotalMedia;
    files.slice(0, remaining).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.editNewFiles = [...this.editNewFiles, { type, file, preview: e.target?.result as string }];
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  savePost(post: Post): void {
    if (this.editingPostId !== post.id) return;

    if (!this.editContent.trim() && this.editTotalMedia === 0) {
      this.toastService.warning('Atenção', 'A publicação precisa de texto ou média.');
      return;
    }

    this.postService.update(post.id, {
      content: this.editContent,
      keepMedia: this.editMediaItems,
      newFiles: this.editNewFiles.map(f => f.file),
    }).subscribe({
      next: (updatedPost) => {
        this.posts = this.posts.map(p => p.id === post.id ? { ...updatedPost, has_bazed: p.has_bazed, bazes_count: p.bazes_count } : p);
        this.cancelEdit();
        this.cdr.detectChanges();
        this.toastService.success('Editado!', 'Publicação atualizada com sucesso.');
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Não foi possível editar o post.';
        this.cdr.detectChanges();
        this.toastService.error('Erro!', 'Não foi possível editar a publicação.');
      }
    });
  }

  openReport(post: Post, event: Event): void {
    event.stopPropagation();
    this.reportTarget = post;
    this.reportReason = 'inappropriate';
    this.reportDescription = '';
    this.showReportModal = true;
    this.activeMenuId = null;
  }

  closeReport(): void {
    this.showReportModal = false;
    this.reportTarget = null;
  }

  submitReport(): void {
    if (!this.reportTarget) return;
    this.reportLoading = true;
    this.reportService.report('post', this.reportTarget.id, this.reportReason, this.reportDescription || undefined).subscribe({
      next: () => {
        this.reportLoading = false;
        this.closeReport();
        this.toastService.success('Denúncia enviada', 'Obrigado. Vamos analisar o conteúdo.');
      },
      error: (err) => {
        this.reportLoading = false;
        const msg = err?.error?.errors?.general?.[0] || err?.error?.message || 'Não foi possível enviar a denúncia.';
        this.toastService.error('Erro', msg);
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
        this.posts = this.posts.filter(p => p.id !== this.postToDelete?.id);
        this.showConfirmDialog = false;
        this.postToDelete = null;
        this.cdr.detectChanges();
        this.toastService.success('Eliminado!', 'Publicação removida com sucesso.');
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Não foi possível excluir o post.';
        this.showConfirmDialog = false;
        this.postToDelete = null;
        this.cdr.detectChanges();
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