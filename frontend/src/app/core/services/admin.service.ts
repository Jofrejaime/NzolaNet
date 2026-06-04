import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiUrlService } from './api-url.service';
import { ApiResponse, Comment, NzolaUser, PaginatedResponse, Post } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient, private apiUrl: ApiUrlService) {}

  listUsers(search = '') {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.http
      .get<ApiResponse<PaginatedResponse<NzolaUser>>>(`${this.apiUrl.apiUrl}/admin/users${params}`)
      .pipe(map((r) => r.data));
  }

  toggleUser(id: number) {
    return this.http.patch<ApiResponse<NzolaUser>>(`${this.apiUrl.apiUrl}/admin/users/${id}/toggle`, {});
  }

  deleteUser(id: number) {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl.apiUrl}/admin/users/${id}`);
  }

  listPosts() {
    return this.http
      .get<ApiResponse<PaginatedResponse<Post>>>(`${this.apiUrl.apiUrl}/admin/posts`)
      .pipe(map((r) => r.data));
  }

  deletePost(id: number) {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl.apiUrl}/admin/posts/${id}`);
  }

  listComments() {
    return this.http
      .get<ApiResponse<PaginatedResponse<Comment>>>(`${this.apiUrl.apiUrl}/admin/comments`)
      .pipe(map((r) => r.data));
  }

  deleteComment(id: number) {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl.apiUrl}/admin/comments/${id}`);
  }
}
