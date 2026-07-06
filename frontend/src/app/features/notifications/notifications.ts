import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { NzolaNotification } from '../../core/models/api.models';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { ToastService } from '../../core/services/toast.service';
import { UserService } from '../../core/services/user.service';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';

export type NotifType = 'like' | 'comment' | 'reply' | 'follow' | 'follow_request' | 'repost' | 'content_removed' | 'new_report' | 'report_dismissed';

export interface NotifUser {
  name: string;
  initials: string;
  colorClass: string;
}

export interface Notification {
  id: number;
  type: NotifType;
  read: boolean;
  isToday: boolean;
  user: NotifUser;
  message: string;
  quote?: string;
  time: string;
  postThumb?: boolean;
  routeTo?: string;
  fromUserId?: number;
  followRequestState?: 'pending' | 'accepted' | 'rejected';
}

export interface NotifGroup {
  label: string;
  items: Notification[];
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, SkeletonComponent, RouterModule],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.scss'],
  host: { class: 'block w-full' },
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private realtimeService = inject(RealtimeService);
  private toastService = inject(ToastService);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  allNotifications: Notification[] = [];
  groupedNotifications: NotifGroup[] = [];
  isLoading = true;
  skeletonItems = [1, 2, 3, 4, 5];
  private realtimeSub?: Subscription;

  ngOnInit(): void {
    this.loadNotifications();
    this.listenForRealtimeNotifications();
  }

  ngOnDestroy(): void {
    this.realtimeSub?.unsubscribe();
  }

  loadNotifications(): void {
    this.isLoading = true;

    this.notificationService
      .list()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (page) => {
          this.allNotifications = page.data.map((item, index) => this.mapNotification(item, index));
          this.buildGroups();
        },
        error: () => {
          this.toastService.error('Erro', 'Não foi possivel carregar as notificacoes.');
        },
      });
  }

  buildGroups(): void {
    const today = this.allNotifications.filter((n) => n.isToday);
    const previous = this.allNotifications.filter((n) => !n.isToday);

    this.groupedNotifications = [];
    if (today.length) this.groupedNotifications.push({ label: 'Hoje', items: today });
    if (previous.length) this.groupedNotifications.push({ label: 'Anteriores', items: previous });
  }

  markAsRead(notif: Notification, event: Event): void {
    event.stopPropagation();
    if (notif.read) {
      return;
    }

    this.notificationService.markAsRead(notif.id).subscribe({
      next: () => {
        notif.read = true;
        this.realtimeService.setUnreadCount(this.unreadCount);
        this.toastService.success('Lida!', 'Notificação marcada como lida.');
        this.cdr.detectChanges();
      },
      error: () => this.toastService.error('Erro', 'Não foi possivel marcar a notificação.'),
    });
  }

  markAllAsRead(): void {
    const unreadCount = this.unreadCount;
    if (unreadCount === 0) {
      this.toastService.info('Info', 'Não ha notificacoes não lidas.');
      return;
    }

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.allNotifications.forEach((n) => n.read = true);
        this.realtimeService.resetUnreadCount();
        this.toastService.success('Todas lidas!', `${unreadCount} notificacoes marcadas como lidas.`);
        this.cdr.detectChanges();
      },
      error: () => this.toastService.error('Erro', 'Não foi possivel marcar todas como lidas.'),
    });
  }

  onNotifClick(notif: Notification): void {
    if (!notif.read) {
      this.notificationService.markAsRead(notif.id).subscribe({
        next: () => {
          notif.read = true;
          this.realtimeService.setUnreadCount(this.unreadCount);
          this.cdr.detectChanges();
        },
      });
    }

    if (notif.routeTo) {
      this.router.navigate([notif.routeTo]);
    }
  }

  acceptFollowRequest(notif: Notification, event: Event): void {
    event.stopPropagation();
    if (!notif.fromUserId || notif.followRequestState !== 'pending') return;
    
    notif.followRequestState = 'accepted';
    this.userService.acceptFollowRequest(notif.fromUserId).subscribe({
      next: () => {
        this.toastService.success('Pedido aceite!', 'Agora este utilizador é teu seguidor.');
        this.cdr.detectChanges();
      },
      error: () => {
        notif.followRequestState = 'pending';
        this.toastService.error('Erro', 'Não foi possivel aceitar o pedido.');
        this.cdr.detectChanges();
      }
    });
  }

  rejectFollowRequest(notif: Notification, event: Event): void {
    event.stopPropagation();
    if (!notif.fromUserId || notif.followRequestState !== 'pending') return;
    
    notif.followRequestState = 'rejected';
    this.userService.rejectFollowRequest(notif.fromUserId).subscribe({
      next: () => {
        this.toastService.info('Pedido rejeitado', 'O utilizador não foi notificado da rejeição.');
        this.cdr.detectChanges();
      },
      error: () => {
        notif.followRequestState = 'pending';
        this.toastService.error('Erro', 'Não foi possivel rejeitar o pedido.');
        this.cdr.detectChanges();
      }
    });
  }

  get unreadCount(): number {
    return this.allNotifications.filter((n) => !n.read).length;
  }

  private listenForRealtimeNotifications(): void {
    const userId = this.authService.currentUser()?.id;
    if (!userId) {
      return;
    }

    // Ensure private notification channel is connected
    this.realtimeService.connectToNotifications(userId);

    this.realtimeSub = this.realtimeService.notifications$.subscribe((notification) => {
      // Avoid duplicates
      if (this.allNotifications.some((item) => item.id === notification.id)) {
        return;
      }

      this.allNotifications = [
        this.mapNotification(notification, 0),
        ...this.allNotifications,
      ];
      this.buildGroups();
      this.toastService.info('Nova notificação', this.messageFor(notification.type));
      this.cdr.detectChanges();
    });
  }

  private mapNotification(item: NzolaNotification, index: number): Notification {
    const name = item.from_user?.name ?? 'Utilizador';
    const type = this.mapType(item.type);
    const createdAt = item.created_at ? new Date(item.created_at) : new Date();

    let routeTo: string | undefined = item.post_id ? `/post/${item.post_id}` : `/profile/${item.from_user_id}`;
    
    let notifUser = {
      name,
      initials: this.initials(name),
      colorClass: this.colorClass(index),
    };

    if (type === 'new_report') {
      routeTo = '/admin';
    } else if (type === 'content_removed' || type === 'report_dismissed') {
      routeTo = undefined;
      notifUser = {
        name: 'NzolaNet',
        initials: 'Nz',
        colorClass: 'color-gray', // Uses a generic or fallback color
      };
    }

    return {
      id: item.id,
      type,
      read: item.is_read,
      isToday: this.isToday(createdAt),
      user: notifUser,
      message: this.messageFor(item.type),
      quote: (item.type === 'comment' || item.type === 'reply') ? item.comment?.content : undefined,
      time: this.relativeTime(createdAt),
      postThumb: item.type === 'baze' && !!item.post_id,
      routeTo,
      fromUserId: item.from_user_id,
      followRequestState: type === 'follow_request' ? 'pending' : undefined,
    };
  }

  private mapType(type: NzolaNotification['type']): NotifType {
    if (type === 'baze') return 'like';
    if (type === 'reply') return 'reply';
    if (type === 'content_removed') return 'content_removed';
    if (type === 'new_report') return 'new_report';
    if (type === 'report_dismissed') return 'report_dismissed';
    return type as NotifType;
  }

  private messageFor(type: NzolaNotification['type']): string {
    if (type === 'baze') return 'deu baze na tua publicação.';
    if (type === 'comment') return 'comentou a tua publicação:';
    if (type === 'reply') return 'respondeu ao teu comentário:';
    if (type === 'content_removed') return 'O teu conteúdo foi removido por violar as regras da plataforma.';
    if (type === 'new_report') return 'denunciou um conteúdo para ser analisado.';
    if (type === 'report_dismissed') return 'A tua denúncia foi analisada e o conteúdo não fere os termos.';
    if (type === 'follow_request') return 'pediu para seguir-te.';
    return 'começou a seguir-te.';
  }

  private initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  private colorClass(index: number): string {
    return ['color-orange', 'color-blue', 'color-green', 'color-purple', 'color-yellow'][index % 5];
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  private relativeTime(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.max(1, Math.floor(diffMs / 60000));

    if (minutes < 60) return `Ha ${minutes} min`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Ha ${hours} h`;

    return date.toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}