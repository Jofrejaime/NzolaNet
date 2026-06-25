import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { ApiUrlService } from './api-url.service';
import { AuthService } from './auth.service';
import { NzolaNotification } from '../models/api.models';

type NotificationHandler = (notification: NzolaNotification) => void;

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private echo?: Echo;
  private connectedUserId?: number;

  constructor(
    private apiUrl: ApiUrlService,
    private authService: AuthService
  ) {}

  connectToNotifications(userId: number, handler: NotificationHandler): void {
    const echo = this.getEcho();

    if (this.connectedUserId && this.connectedUserId !== userId) {
      this.disconnectFromNotifications(this.connectedUserId);
    }

    this.connectedUserId = userId;

    echo
      .private(`notifications.${userId}`)
      .listen('.notification.created', (event: { notification: NzolaNotification }) => {
        handler(event.notification);
      });
  }

  disconnectFromNotifications(userId = this.connectedUserId): void {
    if (!this.echo || !userId) {
      return;
    }

    this.echo.leave(`private-notifications.${userId}`);
    this.connectedUserId = undefined;
  }

  disconnect(): void {
    this.disconnectFromNotifications();
    this.echo?.disconnect();
    this.echo = undefined;
  }

  private getEcho(): Echo {
    if (this.echo) {
      return this.echo;
    }

    this.echo = new Echo({
      broadcaster: 'reverb',
      key: this.apiUrl.reverb.key,
      wsHost: this.apiUrl.reverb.host,
      wsPort: this.apiUrl.reverb.port,
      wssPort: this.apiUrl.reverb.port,
      forceTLS: this.apiUrl.reverb.scheme === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${this.apiUrl.apiUrl}/broadcasting/auth`,
      authorizer: (channel: { name: string }) => ({
        authorize: (
          socketId: string,
          callback: (error: unknown, data: unknown) => void
        ) => {
          fetch(`${this.apiUrl.apiUrl}/broadcasting/auth`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.authService.token ?? ''}`,
            },
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel.name,
            }),
          })
            .then(async (response) => {
              const data = await response.json();
              callback(response.ok ? null : data, data);
            })
            .catch((error) => callback(error, null));
        },
      }),
      client: new Pusher(this.apiUrl.reverb.key, {
        wsHost: this.apiUrl.reverb.host,
        wsPort: this.apiUrl.reverb.port,
        wssPort: this.apiUrl.reverb.port,
        forceTLS: this.apiUrl.reverb.scheme === 'https',
        enabledTransports: ['ws', 'wss'],
        cluster: 'mt1',
      }),
    });

    return this.echo;
  }
}
