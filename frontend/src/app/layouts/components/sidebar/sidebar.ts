import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ApiUrlService } from '../../../core/services/api-url.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RealtimeService } from '../../../core/services/realtime.service';

@Component({
  selector: 'nzola-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  apiUrl = inject(ApiUrlService);
  private notificationService = inject(NotificationService);
  private realtimeService = inject(RealtimeService);

  unreadCount = signal(0);
  private unreadCountSub?: Subscription;

  ngOnInit(): void {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    // Load initial unread count from API
    this.notificationService.unreadCount().subscribe({
      next: (count) => {
        this.realtimeService.setUnreadCount(count);
      },
    });

    // Connect to real-time channels (private + public)
    this.realtimeService.connectToNotifications(userId);

    // Subscribe to the shared unread count observable
    this.unreadCountSub = this.realtimeService.unreadCount$.subscribe((count) => {
      this.unreadCount.set(count);
    });
  }

  ngOnDestroy(): void {
    this.unreadCountSub?.unsubscribe();
  }

  photoUrl(path?: string | null): string | null {
    return this.apiUrl.storageUrl(path);
  }

  initials(name?: string): string {
    return name ? name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2) : 'NU';
  }

  username(name?: string): string {
    return (name || 'utilizador').toLowerCase().replace(/\s+/g, '_');
  }
}