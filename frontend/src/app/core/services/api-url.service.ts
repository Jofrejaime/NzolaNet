import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiUrlService {
  private readonly baseUrl = 'http://localhost:8000';
  readonly apiUrl = `${this.baseUrl}/api`;

  storageUrl(path?: string | null): string | null {
    if (!path) {
      return null;
    }

    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    return `${this.baseUrl}/storage/${path}`;
  }
}
