import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiUrlService } from './api-url.service';
import { ApiResponse, PaginatedResponse, Post, PostMedia } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class PostService {
  constructor(private http: HttpClient, private apiUrl: ApiUrlService) { }

  list() {
    return this.http
      .get<ApiResponse<PaginatedResponse<Post>>>(`${this.apiUrl.apiUrl}/posts`)
      .pipe(map((response) => response.data));
  }

  show(id: number) {
    return this.http
      .get<ApiResponse<Post>>(`${this.apiUrl.apiUrl}/posts/${id}`)
      .pipe(map((response) => response.data));
  }

  create(payload: { content: string; media?: File[] }) {
    const formData = new FormData();

    if (payload.content?.trim()) {
      formData.append('content', payload.content.trim());
    }

    (payload.media ?? []).forEach(file => formData.append('media[]', file, file.name));

    return this.http
      .post<ApiResponse<Post>>(`${this.apiUrl.apiUrl}/posts`, formData)
      .pipe(map((response) => response.data));
  }

  update(id: number, payload: {
    content: string;
    keepMedia?: PostMedia[];
    newFiles?: File[];
  }) {
    const formData = new FormData();

    if (payload.content?.trim()) {
      formData.append('content', payload.content.trim());
    }

    formData.append('keep_media', JSON.stringify(payload.keepMedia ?? []));

    (payload.newFiles ?? []).forEach(file => formData.append('media[]', file, file.name));

    formData.append('_method', 'PUT');

    return this.http
      .post<ApiResponse<Post>>(`${this.apiUrl.apiUrl}/posts/${id}`, formData)
      .pipe(map((response) => response.data));
  }

  delete(id: number) {
    return this.http
      .delete<ApiResponse<null>>(`${this.apiUrl.apiUrl}/posts/${id}`)
      .pipe(map((response) => response));
  }

  addBaze(id: number) {
    return this.http
      .post<ApiResponse<null>>(`${this.apiUrl.apiUrl}/posts/${id}/baze`, {})
      .pipe(map((response) => response));
  }

  removeBaze(id: number) {
    return this.http
      .delete<ApiResponse<null>>(`${this.apiUrl.apiUrl}/posts/${id}/baze`)
      .pipe(map((response) => response));
  }
}
