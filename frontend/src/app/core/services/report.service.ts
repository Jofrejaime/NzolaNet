import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiUrlService } from './api-url.service';
import { ApiResponse, PaginatedResponse, Report } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private http: HttpClient, private apiUrl: ApiUrlService) {}

  report(type: 'post' | 'comment', id: number, reason: string, description?: string) {
    return this.http
      .post<ApiResponse<Report>>(`${this.apiUrl.apiUrl}/reports`, { type, id, reason, description })
      .pipe(map((r) => r.data));
  }

  listReports(status = 'pending', perPage = 20) {
    return this.http
      .get<ApiResponse<PaginatedResponse<Report>>>(
        `${this.apiUrl.apiUrl}/admin/reports?status=${status}&per_page=${perPage}`
      )
      .pipe(map((r) => r.data));
  }

  review(reportId: number, action: 'remove' | 'dismiss') {
    return this.http
      .patch<ApiResponse<null>>(`${this.apiUrl.apiUrl}/admin/reports/${reportId}`, { action })
      .pipe(map((r) => r));
  }
}
