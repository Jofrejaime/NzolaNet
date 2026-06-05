import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AdminDashboardData, Comment, NzolaUser, Post } from '../../core/models/api.models';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'nzola-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  currentUserRole: string;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private toast: ToastService,
    private authService: AuthService
  ) {
    this.currentUserId = this.authService.currentUser()?.id ?? 0;
    this.currentUserRole = this.authService.currentUser()?.role ?? 'utilizador';
  }

  /** Only superadministrador can promote/demote/delete users */
  get isSuperAdmin(): boolean {
    return this.currentUserRole === 'superadministrador';
  }

  /** Both superadmin and admin can manage */
  get isAdmin(): boolean {
    return this.currentUserRole === 'superadministrador' || this.currentUserRole === 'administrador';
  }

 ngOnInit(): void {
  const currentUser = this.authService.currentUser();
  console.log('Usuário atual no admin:', {
    id: currentUser?.id,
    name: currentUser?.name,
    email: currentUser?.email,
    role: currentUser?.role,
    is_active: currentUser?.is_active
  });
  
  this.loadTab();
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
    if (!this.isSuperAdmin) return false;
    if (user.role === 'superadministrador' || user.role === 'administrador') return false;
    if (user.id === this.currentUserId) return false;
    return true;
  }

  deleteUser(user: NzolaUser): void {
    if (!this.canDeleteUser(user)) {
      this.toast.error('Impossível', 'Não tem permissão para eliminar este utilizador.');
      return;
    }
    if (!confirm(`Eliminar ${user.name} permanentemente?`)) return;
    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.toast.success('Eliminado', 'Utilizador removido.');
        this.loadTab();
      },
      error: (err) => this.toast.error('Erro', err?.error?.message || 'Não foi possível eliminar.'),
    });
  }

  /** Only superadmin: promote user to admin, or admin to superadmin */
  promote(user: NzolaUser): void {
    if (!this.isSuperAdmin) return;
    const nextRole = user.role === 'utilizador' ? 'administrador' : 'superadministrador';
    const label = nextRole === 'superadministrador' ? 'super-administrador' : 'administrador';
    if (!confirm(`Promover ${user.name} a ${label}?`)) return;

    this.adminService.promoteToAdmin(user.id).subscribe({
      next: () => {
        this.toast.success('Promovido', `${user.name} agora é ${label}.`);
        this.loadTab();
      },
      error: (err) => this.toast.error('Erro', err?.error?.message || 'Não foi possível promover.'),
    });
  }

  /** Only superadmin: demote admin to regular user */
  demote(user: NzolaUser): void {
    if (!this.isSuperAdmin) return;
    if (!confirm(`Remover função de administrador de ${user.name}?`)) return;

    this.adminService.demoteFromAdmin(user.id).subscribe({
      next: () => {
        this.toast.success('Actualizado', `${user.name} voltou a ser utilizador.`);
        this.loadTab();
      },
      error: (err) => this.toast.error('Erro', err?.error?.message || 'Não foi possível rebaixar.'),
    });
  }

  canPromote(user: NzolaUser): boolean {
    if (!this.isSuperAdmin) return false;
    if (user.id === this.currentUserId) return false;
    // Can promote regular users to admin, and admins to superadmin
    return user.role === 'utilizador' || user.role === 'administrador';
  }

  canDemote(user: NzolaUser): boolean {
    if (!this.isSuperAdmin) return false;
    if (user.id === this.currentUserId) return false;
    // Can only demote admins
    return user.role === 'administrador';
  }

  deletePost(post: Post): void {
    if (!confirm('Eliminar esta publicação?')) return;
    this.adminService.deletePost(post.id).subscribe({
      next: () => {
        this.toast.success('Eliminado', 'Publicação removida.');
        this.loadTab();
      },
      error: () => this.toast.error('Erro', 'Não foi possível eliminar a publicação.'),
    });
  }

  deleteComment(comment: Comment): void {
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