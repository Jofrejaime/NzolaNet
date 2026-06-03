import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiUrlService } from './api-url.service';
import { ApiResponse, NzolaUser } from '../models/api.models';

export interface UserWithFollow extends NzolaUser {
  is_following: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient, private apiUrl: ApiUrlService) {}

  /** Listar / pesquisar utilizadores */
  list(search = '') {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.http
      .get<ApiResponse<UserWithFollow[]>>(`${this.apiUrl.apiUrl}/users${params}`)
      .pipe(map((response) => response.data));
  }

  /** Obter detalhes de um utilizador */
  show(id: number) {
    return this.http
      .get<ApiResponse<NzolaUser>>(`${this.apiUrl.apiUrl}/users/${id}`)
      .pipe(map((response) => response.data));
  }

    /** Atualizar perfil */
    updateProfile(data: { name: string; bio: string; is_private: boolean }) {
        return this.http
            .put<ApiResponse<NzolaUser>>(`${this.apiUrl.apiUrl}/profile`, data)
            .pipe(map((response) => response.data));
    }

    /** Carregar foto de perfil */
    uploadProfilePhoto(file: File) {
        const formData = new FormData();
        formData.append('photo', file);
        return this.http
            .post<ApiResponse<NzolaUser>>(`${this.apiUrl.apiUrl}/profile/photo`, formData)
            .pipe(map((response) => response.data));
    }

    /** Seguir um utilizador */
    follow(id: number) {
    return this.http
      .post<ApiResponse<null>>(`${this.apiUrl.apiUrl}/users/${id}/follow`, {})
      .pipe(map((response) => response));
  }

  /** Deixar de seguir um utilizador */
  unfollow(id: number) {
    return this.http
      .delete<ApiResponse<null>>(`${this.apiUrl.apiUrl}/users/${id}/follow`)
      .pipe(map((response) => response));
  }

  /** Obter seguidores de um utilizador */
  getFollowers(id: number) {
    return this.http
      .get<ApiResponse<UserWithFollow[]>>(`${this.apiUrl.apiUrl}/users/${id}/followers`)
      .pipe(map((response) => response.data));
  }

  /** Obter utilizadores que um utilizador segue */
  getFollowing(id: number) {
    return this.http
      .get<ApiResponse<UserWithFollow[]>>(`${this.apiUrl.apiUrl}/users/${id}/following`)
      .pipe(map((response) => response.data));
  }
}