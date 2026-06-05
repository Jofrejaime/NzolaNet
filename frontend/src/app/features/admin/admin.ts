import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AdminDashboardData, Comment, NzolaUser, Post } from '../../core/models/api.models';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';

@Component({
  selector: 'nzola-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonComponent],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss'],
  host: { class: 'block w-full' },
})
export class AdminComponent implements OnInit {
  activeTab = signal<'dashboard' | 'users' | 'posts' | 'comments'>('dashboard');
  loading = signal(false);
  userSearch = '';

  users = signal<NzolaUser[]>([]);
  posts = signal<Post[]>([]);
  comments = signal<Comment[]>([]);
  dashboard = signal<AdminDashboardData | null>(null);
  currentUserId: number;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private toast: ToastService,
    private authService: AuthService
  ) {
    this.currentUserId = this.authService.currentUser()?.id ?? 0;
  }

  ngOnInit(): void {
    this.loadTab();
  }

  // Navegação - aceita undefined
  goToProfile(userId: number | undefined, event?: Event): void {
    if (event) event.stopPropagation();
    if (userId) {
      this.router.navigate(['/profile', userId]);
    }
  }

  goToThread(postId: number | undefined, event?: Event): void {
    if (event) event.stopPropagation();
    if (postId) {
      this.router.navigate(['/post', postId]);
    }
  }

  relativeTime(date?: string): string {
    if (!date) return 'agora';
    const minutes = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  setTab(tab: 'dashboard' | 'users' | 'posts' | 'comments'): void {
    this.activeTab.set(tab);
    this.loadTab();
  }

  loadTab(): void {
    this.loading.set(true);
    const tab = this.activeTab();

    if (tab === 'dashboard') {
      this.adminService.getDashboard().subscribe({
        next: (data) => {
          this.dashboard.set(data);
          this.loading.set(false);
        },
        error: () => this.onError(),
      });
      return;
    }

    if (tab === 'users') {
      this.adminService.listUsers(this.userSearch).subscribe({
        next: (page) => {
          this.users.set(page.data);
          this.loading.set(false);
        },
        error: () => this.onError(),
      });
      return;
    }

    if (tab === 'posts') {
      this.adminService.listPosts().subscribe({
        next: (page) => {
          this.posts.set(page.data);
          this.loading.set(false);
        },
        error: () => this.onError(),
      });
      return;
    }

    this.adminService.listComments().subscribe({
      next: (page) => {
        this.comments.set(page.data);
        this.loading.set(false);
      },
      error: () => this.onError(),
    });
  }

  searchUsers(): void {
    if (this.activeTab() === 'users') {
      this.loadTab();
    }
  }

  toggleUser(user: NzolaUser): void {
    this.adminService.toggleUser(user.id).subscribe({
      next: () => {
        this.toast.success('Actualizado', 'Estado do utilizador alterado.');
        this.loadTab();
      },
      error: () => this.toast.error('Erro', 'Não foi possível alterar o utilizador.'),
    });
  }

  canDeleteUser(user: NzolaUser): boolean {
    if (user.role === 'administrador') return false;
    if (user.id === this.currentUserId) return false;
    return true;
  }

  deleteUser(user: NzolaUser): void {
    if (!this.canDeleteUser(user)) {
      this.toast.error('Impossível', 'Não é possível eliminar este utilizador.');
      return;
    }
    if (!confirm(`Eliminar ${user.name}?`)) return;
    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.toast.success('Eliminado', 'Utilizador removido.');
        this.loadTab();
      },
      error: (err) => this.toast.error('Erro', err?.error?.message || 'Não foi possível eliminar.'),
    });
  }

  deletePost(post: Post, event?: Event): void {
    if (event) event.stopPropagation();
    if (!confirm('Eliminar esta publicação?')) return;
    this.adminService.deletePost(post.id).subscribe({
      next: () => {
        this.toast.success('Eliminado', 'Publicação removida.');
        this.loadTab();
      },
      error: () => this.toast.error('Erro', 'Não foi possível eliminar a publicação.'),
    });
  }

  deleteComment(comment: Comment, event?: Event): void {
    if (event) event.stopPropagation();
    if (!confirm('Eliminar este comentário?')) return;
    this.adminService.deleteComment(comment.id).subscribe({
      next: () => {
        this.toast.success('Eliminado', 'Comentário removido.');
        this.loadTab();
      },
      error: () => this.toast.error('Erro', 'Não foi possível eliminar o comentário.'),
    });
  }

  goBack(): void {
    this.router.navigate(['/settings']);
  }

  chartData(data: Record<string, number> | undefined): { label: string; value: number }[] {
    if (!data) return [];
    return Object.entries(data).map(([label, value]) => ({ label, value }));
  }

  get maxChartValue(): number {
    const d = this.dashboard();
    if (!d) return 1;
    const allValues = [
      ...Object.values(d.usersByMonth ?? {}),
      ...Object.values(d.postsByMonth ?? {}),
    ];
    return Math.max(...allValues, 1);
  }

  private onError(): void {
    this.loading.set(false);
    this.toast.error('Erro', 'Não foi possível carregar dados de administração.');
  }
}