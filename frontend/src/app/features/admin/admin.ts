import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AdminDashboardData, Comment, NzolaUser, Post, Report } from '../../core/models/api.models';
import { ReportService } from '../../core/services/report.service';
import { RealtimeService } from '../../core/services/realtime.service';
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
export class AdminComponent implements OnInit, OnDestroy {
  activeTab = signal<'dashboard' | 'users' | 'posts' | 'comments' | 'reports'>('dashboard');
  loading = signal(false);
  userSearch = '';

  users = signal<NzolaUser[]>([]);
  posts = signal<Post[]>([]);
  comments = signal<Comment[]>([]);
  reports = signal<Report[]>([]);
  dashboard = signal<AdminDashboardData | null>(null);
  currentUserId: number;
  currentUserRole: string;
  reviewingReportId: number | null = null;

  private reportCreatedSub?: Subscription;
  pendingReportsCount = signal(0);

  // Modal states
  showUserModal = false;
  showPostModal = false;
  showCommentModal = false;
  showPromoteModal = false;
  showDemoteModal = false;
  
  userModalTitle = '';
  userModalMessage = '';
  userModalConfirmText = '';
  userModalAction: 'toggle' | 'delete' = 'toggle';
  
  promoteModalTitle = '';
  promoteModalMessage = '';
  promoteModalConfirmText = '';
  
  pendingUser: NzolaUser | null = null;
  pendingPost: Post | null = null;
  pendingComment: Comment | null = null;

  constructor(
    private adminService: AdminService,
    private reportService: ReportService,
    private realtimeService: RealtimeService,
    private router: Router,
    private toast: ToastService,
    private authService: AuthService
  ) {
    this.currentUserId = this.authService.currentUser()?.id ?? 0;
    this.currentUserRole = this.authService.currentUser()?.role ?? 'utilizador';
  }

  get isSuperAdmin(): boolean {
    return this.currentUserRole === 'superadministrador';
  }

  get isAdmin(): boolean {
    return this.currentUserRole === 'superadministrador' || this.currentUserRole === 'administrador';
  }

  ngOnInit(): void {
    this.loadTab();
    this.realtimeService.connectToAdminChannel();
    this.reportCreatedSub = this.realtimeService.reportCreated$.subscribe((report) => {
      this.pendingReportsCount.update(c => c + 1);
      const type = report.reportable_type === 'post' ? 'publicação' : 'comentário';
      this.toast.warning('Nova denúncia', `Denúncia de ${type} recebida (motivo: ${report.reason}).`);
      // If already viewing reports tab, prepend in real-time
      if (this.activeTab() === 'reports') {
        this.reports.update(list => [report, ...list]);
      }
    });
  }

  ngOnDestroy(): void {
    this.reportCreatedSub?.unsubscribe();
    this.realtimeService.disconnectFromAdminChannel();
  }

  // Navegação
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

  private static readonly REPORT_REASON_LABELS: Record<string, string> = {
    spam: 'Spam',
    inappropriate: 'Conteúdo inapropriado',
    harassment: 'Assédio',
    hate_speech: 'Discurso de ódio',
    violence: 'Violência',
    other: 'Outro',
  };

  reasonLabel(reason: string): string {
    return AdminComponent.REPORT_REASON_LABELS[reason] ?? reason;
  }

  // Modal methods for Users
  openToggleUserModal(user: NzolaUser): void {
    this.pendingUser = user;
    this.userModalTitle = user.is_active ? 'Desactivar utilizador' : 'Activar utilizador';
    this.userModalMessage = user.is_active 
      ? `Tens a certeza que queres desactivar "${user.name}"? O utilizador não poderá aceder à plataforma.`
      : `Tens a certeza que queres activar "${user.name}"? O utilizador poderá voltar a aceder à plataforma.`;
    this.userModalConfirmText = user.is_active ? 'Desactivar' : 'Activar';
    this.userModalAction = 'toggle';
    this.showUserModal = true;
  }

  openDeleteUserModal(user: NzolaUser): void {
    this.pendingUser = user;
    this.userModalTitle = 'Eliminar utilizador';
    this.userModalMessage = `Tens a certeza que queres eliminar "${user.name}" permanentemente? Todos os seus dados serão removidos.`;
    this.userModalConfirmText = 'Eliminar';
    this.userModalAction = 'delete';
    this.showUserModal = true;
  }

  openPromoteModal(user: NzolaUser): void {
    this.pendingUser = user;
    const nextRole = user.role === 'utilizador' ? 'administrador' : 'superadministrador';
    const label = nextRole === 'superadministrador' ? 'super-administrador' : 'administrador';
    this.promoteModalTitle = `Promover ${user.name}`;
    this.promoteModalMessage = `Tens a certeza que queres promover "${user.name}" a ${label}?`;
    this.promoteModalConfirmText = `Promover a ${label}`;
    this.showPromoteModal = true;
  }

  openDemoteModal(user: NzolaUser): void {
    this.pendingUser = user;
    this.promoteModalTitle = `Rebaixar ${user.name}`;
    this.promoteModalMessage = `Tens a certeza que queres remover a função de administrador de "${user.name}"?`;
    this.promoteModalConfirmText = 'Rebaixar';
    this.showDemoteModal = true;
  }

  confirmUserAction(): void {
    if (!this.pendingUser) return;
    
    if (this.userModalAction === 'toggle') {
      this.toggleUser(this.pendingUser);
    } else {
      this.deleteUser(this.pendingUser);
    }
    this.closeModals();
  }

  confirmPromote(): void {
    if (!this.pendingUser) return;
    this.promote(this.pendingUser);
    this.closeModals();
  }

  confirmDemote(): void {
    if (!this.pendingUser) return;
    this.demote(this.pendingUser);
    this.closeModals();
  }

  // Modal methods for Posts
  openDeletePostModal(post: Post, event: Event): void {
    event.stopPropagation();
    this.pendingPost = post;
    this.showPostModal = true;
  }

  confirmPostDelete(): void {
    if (!this.pendingPost) return;
    this.deletePost(this.pendingPost);
    this.closeModals();
  }

  // Modal methods for Comments
  openDeleteCommentModal(comment: Comment, event: Event): void {
    event.stopPropagation();
    this.pendingComment = comment;
    this.showCommentModal = true;
  }

  confirmCommentDelete(): void {
    if (!this.pendingComment) return;
    this.deleteComment(this.pendingComment);
    this.closeModals();
  }

  closeModals(): void {
    this.showUserModal = false;
    this.showPostModal = false;
    this.showCommentModal = false;
    this.showPromoteModal = false;
    this.showDemoteModal = false;
    this.pendingUser = null;
    this.pendingPost = null;
    this.pendingComment = null;
  }

  setTab(tab: 'dashboard' | 'users' | 'posts' | 'comments' | 'reports'): void {
    this.activeTab.set(tab);
    if (tab === 'reports') {
      this.pendingReportsCount.set(0);
    }
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

    if (tab === 'comments') {
      this.adminService.listComments().subscribe({
        next: (page) => {
          this.comments.set(page.data);
          this.loading.set(false);
        },
        error: () => this.onError(),
      });
      return;
    }

    this.reportService.listReports('pending', 50).subscribe({
      next: (page) => {
        this.reports.set(page.data);
        this.loading.set(false);
      },
      error: () => this.onError(),
    });
  }

  reviewReport(reportId: number, action: 'remove' | 'dismiss'): void {
    this.reviewingReportId = reportId;
    this.reportService.review(reportId, action).subscribe({
      next: () => {
        this.reviewingReportId = null;
        this.reports.update(list => list.filter(r => r.id !== reportId));
        const msg = action === 'remove' ? 'Conteúdo removido.' : 'Denúncia dispensada.';
        this.toast.success('Feito', msg);
      },
      error: (err) => {
        this.reviewingReportId = null;
        this.toast.error('Erro', err?.error?.message || 'Não foi possível processar a denúncia.');
      }
    });
  }

  reportContentSnippet(report: Report): string {
    const content = report.content as any;
    if (!content) return '(conteúdo removido)';
    return content.content?.slice(0, 120) || '(sem texto)';
  }

  reportContentAuthor(report: Report): string {
    const content = report.content as any;
    return content?.user?.name || 'Utilizador';
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
    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.toast.success('Eliminado', 'Utilizador removido.');
        this.loadTab();
      },
      error: (err) => this.toast.error('Erro', err?.error?.message || 'Não foi possível eliminar.'),
    });
  }

  promote(user: NzolaUser): void {
    const nextRole = user.role === 'utilizador' ? 'administrador' : 'superadministrador';
    const label = nextRole === 'superadministrador' ? 'super-administrador' : 'administrador';
    
    this.adminService.promoteToAdmin(user.id).subscribe({
      next: () => {
        this.toast.success('Promovido', `${user.name} agora é ${label}.`);
        this.loadTab();
      },
      error: (err) => this.toast.error('Erro', err?.error?.message || 'Não foi possível promover.'),
    });
  }

  demote(user: NzolaUser): void {
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
    return user.role === 'utilizador' || user.role === 'administrador';
  }

  canDemote(user: NzolaUser): boolean {
    if (!this.isSuperAdmin) return false;
    if (user.id === this.currentUserId) return false;
    return user.role === 'administrador';
  }

  deletePost(post: Post): void {
    this.adminService.deletePost(post.id).subscribe({
      next: () => {
        this.toast.success('Eliminado', 'Publicação removida.');
        this.loadTab();
      },
      error: () => this.toast.error('Erro', 'Não foi possível eliminar a publicação.'),
    });
  }

  deleteComment(comment: Comment): void {
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