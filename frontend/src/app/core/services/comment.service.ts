import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiUrlService } from './api-url.service';
import { ApiResponse, Comment, PaginatedResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class CommentService {
  constructor(private http: HttpClient, private apiUrl: ApiUrlService) {}

  list(postId: number) {
    return this.http
      .get<ApiResponse<PaginatedResponse<Comment>>>(`${this.apiUrl.apiUrl}/posts/${postId}/comments`)
      .pipe(map((response) => response.data));
  }

  create(postId: number, content: string) {
    return this.http
      .post<ApiResponse<Comment>>(`${this.apiUrl.apiUrl}/posts/${postId}/comments`, { content })
      .pipe(map((response) => response.data));
  }
}
