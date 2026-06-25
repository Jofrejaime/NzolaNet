import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiResponse, NzolaNotification, PaginatedResponse } from '../models/api.models';
import { ApiUrlService } from './api-url.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private http: HttpClient, private apiUrl: ApiUrlService) {}

  list() {
    return this.http
      .get<ApiResponse<PaginatedResponse<NzolaNotification>>>(`${this.apiUrl.apiUrl}/notifications`)
      .pipe(map((response) => response.data));
  }

  markAsRead(id: number) {
    return this.http
      .put<ApiResponse<null>>(`${this.apiUrl.apiUrl}/notifications/${id}/read`, {})
      .pipe(map((response) => response));
  }

  markAllAsRead() {
    return this.http
      .put<ApiResponse<null>>(`${this.apiUrl.apiUrl}/notifications/read-all`, {})
      .pipe(map((response) => response));
  }

  unreadCount() {
    return this.http
      .get<ApiResponse<{ count: number }>>(`${this.apiUrl.apiUrl}/notifications/unread-count`)
      .pipe(map((response) => response.data.count));
  }
}
