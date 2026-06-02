import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiUrlService } from './api-url.service';
import { ApiResponse, NzolaUser } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient, private apiUrl: ApiUrlService) {}

  updateProfile(payload: { name: string; bio?: string | null; is_private?: boolean }) {
    return this.http
      .put<ApiResponse<NzolaUser>>(`${this.apiUrl.apiUrl}/profile`, payload)
      .pipe(map((response) => response.data));
  }

  uploadProfilePhoto(photo: File) {
    const formData = new FormData();
    formData.append('photo', photo);

    return this.http
      .post<ApiResponse<NzolaUser>>(`${this.apiUrl.apiUrl}/profile/photo`, formData)
      .pipe(map((response) => response.data));
  }
}
