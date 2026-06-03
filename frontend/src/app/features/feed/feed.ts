import { Component, OnInit, ChangeDetectorRef, ApplicationRef, NgZone } from '@angular/core';
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

  loadFeed(): void {
    console.log('🟡 loadFeed() chamado');
    
    this.ngZone.run(() => {
      this.isLoading = true;
      this.errorMessage = '';
    });

    this.postService.list().subscribe({
      next: (page) => {
        console.log('✅ Resposta recebida:', page);
        
        this.ngZone.run(() => {
          this.posts = [...page.data]; // Criar nova referência
          this.isLoading = false;
          
          // Forçar atualização da view
          this.cdr.detectChanges();
          this.cdr.markForCheck();
          this.appRef.tick();
          
          console.log('🟢 Posts atualizados:', this.posts.length);
        });
      },
      error: (error) => {
        console.error('❌ Erro:', error);
        
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel carregar o feed. Confirma se o Laravel esta a correr em http://localhost:8000.';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  initials(name?: string): string {
    if (!name) {
      return '?';
    }
    return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
  }

  username(name?: string): string {
    return (name || 'utilizador').toLowerCase().replace(/\s+/g, '_');
  }

  mediaUrl(path?: string | null): string | null {
    return this.apiUrl.storageUrl(path);
  }

  openPost(post: Post): void {
    this.router.navigate(['/post', post.id]);
  }

  isOwnPost(post: Post): boolean {
    return this.authService.currentUser()?.id === post.user_id;
  }

  beginEdit(post: Post): void {
    this.actionMessage = '';
    this.editingPostId = post.id;
    this.editContent = post.content || '';
  }

  cancelEdit(): void {
    this.editingPostId = null;
    this.editContent = '';
  }

  savePost(post: Post): void {
    if (!this.editContent.trim()) {
      this.actionMessage = 'A publicacao precisa de texto para esta edicao.';
      return;
    }

    this.postService.update(post.id, { content: this.editContent }).subscribe({
      next: (updatedPost) => {
        this.posts = this.posts.map((item) => item.id === post.id ? updatedPost : item);
        this.cancelEdit();
      },
      error: (error) => {
        this.actionMessage = error?.error?.message || 'Nao foi possivel editar a publicacao.';
      }
    });
  }

  deletePost(post: Post): void {
    if (!confirm('Excluir esta publicacao?')) {
      return;
    }

    this.actionMessage = '';
    this.postService.delete(post.id).subscribe({
      next: () => {
        this.posts = this.posts.filter((item) => item.id !== post.id);
      },
      error: (error) => {
        this.actionMessage = error?.error?.message || 'Nao foi possivel excluir a publicacao.';
      }
    });
  }

  toggleBaze(post: Post): void {
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
        this.actionMessage = error?.error?.message || 'Nao foi possivel atualizar o baze.';
      }
    });
  }

  relativeTime(date?: string): string {
    if (!date) {
      return 'agora';
    }

    const diffMs = Date.now() - new Date(date).getTime();
    const minutes = Math.max(1, Math.floor(diffMs / 60000));

    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h`;
    }

    return `${Math.floor(hours / 24)}d`;
  }
}