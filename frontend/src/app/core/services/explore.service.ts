import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiUrlService } from './api-url.service';
import { ApiResponse, PaginatedResponse, Post } from '../models/api.models';

export interface Trend {
  category: string;
  tag: string;
  posts: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExploreService {
  constructor(
    private http: HttpClient,
    private apiUrl: ApiUrlService
  ) {}

  getPopularPosts() {
    return this.http
      .get<ApiResponse<PaginatedResponse<Post>>>(`${this.apiUrl.apiUrl}/explore/popular`)
      .pipe(map((response) => response.data));
  }

  getTrends() {
    return this.http
      .get<ApiResponse<Trend[]>>(`${this.apiUrl.apiUrl}/explore/trends`)
      .pipe(map((response) => response.data));
  }
}
