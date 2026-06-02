import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { ApiUrlService } from './api-url.service';
import { ApiResponse, AuthPayload, NzolaUser } from '../models/api.models';

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  bio?: string;
  is_private?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'nzolanet_token';
  private readonly userKey = 'nzolanet_user';

  currentUser = signal<NzolaUser | null>(this.restoreUser());

  constructor(
    private http: HttpClient,
    private apiUrl: ApiUrlService,
    private router: Router
  ) {}

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }

  login(credentials: LoginCredentials) {
    return this.http.post<ApiResponse<AuthPayload>>(`${this.apiUrl.apiUrl}/login`, credentials).pipe(
      tap((response) => this.persistSession(response.data)),
      map((response) => response.data)
    );
  }

  register(payload: RegisterPayload) {
    return this.http.post<ApiResponse<AuthPayload>>(`${this.apiUrl.apiUrl}/register`, payload).pipe(
      tap((response) => this.persistSession(response.data)),
      map((response) => response.data)
    );
  }

  loadUser() {
    return this.http.get<ApiResponse<NzolaUser>>(`${this.apiUrl.apiUrl}/user`).pipe(
      tap((response) => this.persistUser(response.data)),
      map((response) => response.data)
    );
  }

  logout(): void {
    const token = this.token;

    if (token) {
      this.http.post(`${this.apiUrl.apiUrl}/logout`, {}).subscribe({
        next: () => this.finishLogout(),
        error: () => this.finishLogout()
      });
      return;
    }

    this.finishLogout();
  }

  private persistSession(payload: AuthPayload): void {
    localStorage.setItem(this.tokenKey, payload.access_token);
    this.persistUser(payload.user);
  }

  private persistUser(user: NzolaUser): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser.set(null);
  }

  private finishLogout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  private restoreUser(): NzolaUser | null {
    const rawUser = localStorage.getItem(this.userKey);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as NzolaUser;
    } catch {
      return null;
    }
  }
}
