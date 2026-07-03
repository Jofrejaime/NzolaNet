import { Injectable, OnDestroy } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { Subject, BehaviorSubject } from 'rxjs';
import { ApiUrlService } from './api-url.service';
import { AuthService } from './auth.service';
import { NzolaNotification, Post, Report } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class RealtimeService implements OnDestroy {
  private echo?: Echo;
  private connectedUserId?: number;
  private publicChannelConnected = false;
  private adminChannelConnected = false;

  private notificationSubject = new Subject<NzolaNotification>();
  private postBazeSubject = new Subject<{ post_id: number; bazes_count: number }>();
  private newPostSubject = new Subject<Post>();
  private postDeletedSubject = new Subject<{ post_id: number }>();
  private commentDeletedSubject = new Subject<{ comment_id: number; post_id: number }>();
  private reportCreatedSubject = new Subject<Report>();
  private unreadCountSubject = new BehaviorSubject<number>(0);

  readonly notifications$ = this.notificationSubject.asObservable();
  readonly postBazeUpdates$ = this.postBazeSubject.asObservable();
  readonly newPost$ = this.newPostSubject.asObservable();
  readonly postDeleted$ = this.postDeletedSubject.asObservable();
  readonly commentDeleted$ = this.commentDeletedSubject.asObservable();
  readonly reportCreated$ = this.reportCreatedSubject.asObservable();
  readonly unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private apiUrl: ApiUrlService,
    private authService: AuthService
  ) {}

  connectToPublicChannels(): void {
    if (this.publicChannelConnected) {
      return;
    }

    const echo = this.getEcho();
    console.log('[Realtime] Subscribing to public posts channel');

    echo
      .channel('posts')
      .listen('.post.baze.updated', (event: { post_id: number; bazes_count: number }) => {
        this.postBazeSubject.next(event);
      })
      .listen('.post.created', (event: { post: Post }) => {
        this.newPostSubject.next(event.post);
      })
      .listen('.post.deleted', (event: { post_id: number }) => {
        console.log('[Realtime] Post deleted:', event.post_id);
        this.postDeletedSubject.next(event);
      })
      .listen('.comment.deleted', (event: { comment_id: number; post_id: number }) => {
        console.log('[Realtime] Comment deleted:', event.comment_id);
        this.commentDeletedSubject.next(event);
      });

    this.publicChannelConnected = true;
  }

  connectToNotifications(userId: number): void {
    this.connectToPublicChannels();

    if (this.connectedUserId === userId) {
      return;
    }

    if (this.connectedUserId) {
      try {
        this.echo?.leave(`notifications.${this.connectedUserId}`);
      } catch {
        // Ignore
      }
    }

    this.connectedUserId = userId;
    const echo = this.getEcho();

    console.log('[Realtime] Connecting to notifications channel for user', userId);

    echo
      .private(`notifications.${userId}`)
      .listen('.notification.created', (event: { notification: NzolaNotification }) => {
        console.log('[Realtime] Notification received:', event.notification);
        this.notificationSubject.next(event.notification);
        this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
      })
      .error((error: any) => {
        console.error('[Realtime] Channel subscription error:', error);
      });
  }

  connectToAdminChannel(): void {
    if (this.adminChannelConnected) {
      return;
    }

    const echo = this.getEcho();
    console.log('[Realtime] Subscribing to admin channel');

    echo
      .private('admin')
      .listen('.report.created', (event: { report: Report }) => {
        console.log('[Realtime] New report received:', event.report);
        this.reportCreatedSubject.next(event.report);
      })
      .error((error: any) => {
        console.error('[Realtime] Admin channel error:', error);
      });

    this.adminChannelConnected = true;
  }

  disconnectFromAdminChannel(): void {
    if (!this.adminChannelConnected) return;
    try {
      this.echo?.leave('admin');
    } catch {
      // Ignore
    }
    this.adminChannelConnected = false;
  }

  setUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }

  resetUnreadCount(): void {
    this.unreadCountSubject.next(0);
  }

  disconnectFromNotifications(userId?: number): void {
    const id = userId ?? this.connectedUserId;
    if (!this.echo || !id) {
      return;
    }
    try {
      this.echo.leave(`notifications.${id}`);
    } catch {
      // Ignore errors on leave
    }
    if (!userId || userId === this.connectedUserId) {
      this.connectedUserId = undefined;
    }
  }

  disconnect(): void {
    this.disconnectFromNotifications();
    this.disconnectFromAdminChannel();
    try {
      if (this.publicChannelConnected) {
        this.echo?.leave('posts');
        this.publicChannelConnected = false;
      }
      this.echo?.disconnect();
    } catch {
      // Ignore errors
    }
    this.echo = undefined;
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.notificationSubject.complete();
    this.postBazeSubject.complete();
    this.newPostSubject.complete();
    this.postDeletedSubject.complete();
    this.commentDeletedSubject.complete();
    this.reportCreatedSubject.complete();
    this.unreadCountSubject.complete();
  }

  private getEcho(): Echo {
    if (this.echo) {
      return this.echo;
    }

    const key = this.apiUrl.reverb.key;
    const host = this.apiUrl.reverb.host;
    const port = this.apiUrl.reverb.port;
    const scheme = this.apiUrl.reverb.scheme;

    console.log('[Realtime] Creating Echo connection', { key, host, port, scheme });

    this.echo = new Echo({
      broadcaster: 'reverb',
      Pusher,
      key,
      wsHost: host,
      wsPort: port,
      wssPort: port,
      forceTLS: scheme === 'https',
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
      authorizer: (channel: { name: string }) => ({
        authorize: (
          socketId: string,
          callback: (error: unknown, data: unknown) => void
        ) => {
          const token = this.authService.token;

          if (!token) {
            console.error('[Realtime] No auth token available');
            callback(new Error('Not authenticated'), null);
            return;
          }

          fetch(`${this.apiUrl.apiUrl}/broadcasting/auth`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel.name,
            }),
          })
            .then(async (response) => {
              if (!response.ok) {
                const text = await response.text();
                console.error('[Realtime] Auth failed:', response.status, text);
                callback(new Error(`Auth failed: ${response.status}`), null);
                return;
              }
              const data = await response.json();
              callback(null, data);
            })
            .catch((error) => {
              console.error('[Realtime] Auth request error:', error);
              callback(error, null);
            });
        },
      }),
    });

    return this.echo;
  }
}
