import { Component, OnInit, OnDestroy, ChangeDetectorRef, ApplicationRef, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Post, PostMedia } from '../../core/models/api.models';
import { ApiUrlService } from '../../core/services/api-url.service';
import { PostService } from '../../core/services/post.service';
import { AuthService } from '../../core/services/auth.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { ReportService } from '../../core/services/report.service';
import { ToastService } from '../../core/services/toast.service';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';
import { MediaGalleryComponent } from '../../shared/components/media-gallery/media-gallery';

interface EditMediaFile { type: 'image' | 'video'; file: File; preview: string; }

function getPostMedia(post: Post): PostMedia[] {
  if (post.media?.length) return post.media;
  const items: PostMedia[] = [];
  if (post.image) items.push({ type: 'image', path: post.image });
  if (post.video) items.push({ type: 'video', path: post.video });
  return items;
}

@Component({
  selector: 'nzola-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonComponent, MediaGalleryComponent],
  templateUrl: './feed.html',
  styleUrls: ['./feed.scss'],
  host: { class: 'block w-full' }
})
export class FeedComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  errorMessage = '';
  actionMessage = '';
  editingPostId: number | null = null;
  editContent = '';
  editMediaItems: PostMedia[] = [];
  editNewFiles: EditMediaFile[] = [];

  readonly MAX_EDIT_MEDIA = 4;

  get editTotalMedia(): number { return this.editMediaItems.length + this.editNewFiles.length; }
  get canAddEditMedia(): boolean { return this.editTotalMedia < this.MAX_EDIT_MEDIA; }

  getPostMedia = getPostMedia;

  activeMenuId: number | null = null;
  showConfirmDialog = false;
  postToDelete: Post | null = null;

  // Report state
  showReportModal = false;
  reportTarget: Post | null = null;
  reportReason = 'inappropriate';
  reportDescription = '';
  reportLoading = false;

  skeletonItems = [1, 2, 3];
  private realtimeBazeSub?: Subscription;
  private realtimeNewPostSub?: Subscription;
  private realtimePostDeletedSub?: Subscription;

  constructor(
    private postService: PostService,
    private apiUrl: ApiUrlService,
    private authService: AuthService,
    private realtimeService: RealtimeService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private appRef: ApplicationRef,
    private ngZone: NgZone,
    private toastService: ToastService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.loadFeed();
    this.realtimeService.connectToPublicChannels();
    this.listenForRealtimeBazes();
    this.listenForNewPosts();
    this.listenForDeletedPosts();
  }

  ngOnDestroy(): void {
    this.realtimeBazeSub?.unsubscribe();
    this.realtimeNewPostSub?.unsubscribe();
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

  private listenForNewPosts(): void {
    this.realtimeNewPostSub = this.realtimeService.newPost$.subscribe((post) => {
      if (this.posts.some((p) => p.id === post.id)) return;
      this.ngZone.run(() => {
        this.posts = [post, ...this.posts];
        this.cdr.detectChanges();
      });
    });
  }

  private listenForDeletedPosts(): void {
    this.realtimePostDeletedSub = this.realtimeService.postDeleted$.subscribe(({ post_id }) => {
      this.ngZone.run(() => {
        this.posts = this.posts.filter(p => p.id !== post_id);
        this.cdr.detectChanges();
      });
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
    if (this.reportReason === 'other' && !this.reportDescription.trim()) {
      this.toastService.error('Erro', 'A descrição é obrigatória quando o motivo é "Outro".');
      return;
    }

    this.reportLoading = true;
    this.reportService.report('post', this.reportTarget.id, this.reportReason, this.reportDescription || undefined).subscribe({
      next: () => {
        this.reportLoading = false;
        this.closeReport();
        this.toastService.success('Denúncia enviada', 'Obrigado. Vamos analisar o conteúdo.');
      },
      error: (err) => {
        this.reportLoading = false;
        const errors = err?.error?.errors;
        const msg = (errors && (Object.values(errors)[0] as string[] | undefined)?.[0])
          || err?.error?.message
          || 'Não foi possível enviar a denúncia.';
        this.toastService.error('Erro', msg);
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