import { Injectable, OnDestroy } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { Subject, BehaviorSubject } from 'rxjs';
import { ApiUrlService } from './api-url.service';
import { AuthService } from './auth.service';
import { NzolaNotification } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class RealtimeService implements OnDestroy {
  private echo?: Echo;
  private connectedUserId?: number;
  private publicChannelConnected = false;

  private notificationSubject = new Subject<NzolaNotification>();
  private postBazeSubject = new Subject<{ post_id: number; bazes_count: number }>();
  private unreadCountSubject = new BehaviorSubject<number>(0);

  readonly notifications$ = this.notificationSubject.asObservable();
  readonly postBazeUpdates$ = this.postBazeSubject.asObservable();
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
        console.log('[Realtime] Post baze count updated:', event);
        this.postBazeSubject.next(event);
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
      })
      .subscribed(() => {
        console.log('[Realtime] Successfully subscribed to notifications channel');
      });
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

    // Pusher (a classe, não uma instância) é passado explicitamente para que o Echo
    // consiga criar a sua própria instância com toda a configuração correta,
    // incluindo o authorizer para autenticação de canais privados.
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
