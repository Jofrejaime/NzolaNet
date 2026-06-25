import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiUrlService {
  readonly baseUrl = 'http://localhost:8000';
  readonly apiUrl = `${this.baseUrl}/api`;
  readonly reverb = {
    key: 'nzolanet-local-key',
    host: '127.0.0.1',
    port: 8080,
    scheme: 'http',
  };

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
