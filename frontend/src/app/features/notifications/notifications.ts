import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';

export type NotifType = 'like' | 'comment' | 'follow' | 'repost';

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
}

export interface NotifGroup {
  label: string;
  items: Notification[];
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.scss'],
  host: { class: 'block w-full' },
})
export class NotificationsComponent implements OnInit {
  private router = inject(Router);
  private toastService = inject(ToastService);

  allNotifications: Notification[] = [];
  groupedNotifications: NotifGroup[] = [];
  isLoading = true;
  skeletonItems = [1, 2, 3, 4, 5];

  // Dados mockados (simulando API)
  private mockNotifications: Notification[] = [
    {
      id: 1,
      type: 'like',
      read: false,
      isToday: true,
      user: { name: 'Miguel Sousa', initials: 'MS', colorClass: 'color-orange' },
      message: 'deu baze no teu post.',
      time: 'Há 10 min',
      postThumb: true,
    },
    {
      id: 2,
      type: 'comment',
      read: false,
      isToday: true,
      user: { name: 'Sara Lima', initials: 'SL', colorClass: 'color-blue' },
      message: 'comentou a tua publicação:',
      quote: 'Grande foto, a luz está incrível!',
      time: 'Há 45 min',
    },
    {
      id: 3,
      type: 'follow',
      read: true,
      isToday: false,
      user: { name: 'Tiago Mendes', initials: 'TM', colorClass: 'color-green' },
      message: 'começou a seguir-te.',
      time: 'Ontem, 21:30',
    },
    {
      id: 4,
      type: 'like',
      read: true,
      isToday: false,
      user: { name: 'Carlos Silva', initials: 'CS', colorClass: 'color-purple' },
      message: 'deu baze no teu post.',
      time: 'Ontem, 14:15',
      postThumb: true,
    },
    {
      id: 5,
      type: 'repost',
      read: true,
      isToday: false,
      user: { name: 'Ana Ferreira', initials: 'AF', colorClass: 'color-yellow' },
      message: 'repostou a tua publicação.',
      time: 'Ontem, 09:42',
    },
  ];

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    
    // Simular carregamento de API
    setTimeout(() => {
      this.allNotifications = [...this.mockNotifications];
      this.buildGroups();
      this.isLoading = false;
      this.toastService.info('Notificações', `${this.unreadCount} novas notificações.`);
    }, 1000);
  }

  buildGroups(): void {
    const today = this.allNotifications.filter(n => n.isToday);
    const yesterday = this.allNotifications.filter(n => !n.isToday);

    this.groupedNotifications = [];
    if (today.length) this.groupedNotifications.push({ label: 'Hoje', items: today });
    if (yesterday.length) this.groupedNotifications.push({ label: 'Ontem', items: yesterday });
  }

  markAsRead(notif: Notification, event: Event): void {
    event.stopPropagation();
    if (!notif.read) {
      notif.read = true;
      this.toastService.success('Lida!', 'Notificação marcada como lida.');
    }
  }

  markAllAsRead(): void {
    const unreadCount = this.unreadCount;
    if (unreadCount === 0) {
      this.toastService.info('Info', 'Não há notificações não lidas.');
      return;
    }
    
    this.allNotifications.forEach(n => n.read = true);
    this.toastService.success('Todas lidas!', `${unreadCount} notificações marcadas como lidas.`);
  }

  onNotifClick(notif: Notification): void {
    if (!notif.read) {
      notif.read = true;
    }
    
    if (notif.routeTo) {
      this.router.navigate([notif.routeTo]);
    } else {
      // Navegação padrão baseada no tipo
      switch (notif.type) {
        case 'like':
        case 'comment':
          this.router.navigate(['/post', 1]); // ID do post
          break;
        case 'follow':
          this.router.navigate(['/profile', 1]); // ID do utilizador
          break;
        default:
          break;
      }
    }
  }

  get unreadCount(): number {
    return this.allNotifications.filter(n => !n.read).length;
  }
}