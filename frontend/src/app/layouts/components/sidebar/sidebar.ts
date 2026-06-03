import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiUrlService } from '../../../core/services/api-url.service';

@Component({
  selector: 'nzola-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent {
  constructor(
    public authService: AuthService,
    private apiUrl: ApiUrlService
  ) {}

  photoUrl(path?: string | null): string | null {
    return this.apiUrl.storageUrl(path);
  }

  initials(name?: string): string {
    return name ? name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2) : 'NU';
  }

  username(name?: string): string {
    return (name || 'utilizador').toLowerCase().replace(/\s+/g, '_');
  }
}
