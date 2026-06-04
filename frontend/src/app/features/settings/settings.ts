import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

export interface SettingsItem {
  id: string;
  label: string;
  description?: string;
  icon: string;       // SVG path innerHTML
  badge?: string;
  routeTo?: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss'],
  host: { class: 'block w-full' },
})
export class SettingsComponent {

  private router = inject(Router);
  authService = inject(AuthService);
  themeService = inject(ThemeService);

  // Computed property for dark mode
  get darkMode(): boolean {
    return this.themeService.theme() === 'dark';
  }

  // ── Itens — Conta ────────────────────────────────────
  accountItems: SettingsItem[] = [
    {
      id: 'account',
      label: 'Conta',
      description: 'Nome, email e biografia',
      icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
      routeTo: '/settings/account',
    },
    {
      id: 'privacy',
      label: 'Privacidade',
      description: 'Quem pode ver o teu perfil',
      icon: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
      routeTo: '/settings/privacy',
    },
    {
      id: 'security',
      label: 'Segurança',
      description: 'Alterar palavra-passe',
      icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
      routeTo: '/settings/security',
    },
  ];

  // ── Itens — Preferências (sem aparência e idioma) ────
  preferenceItems: SettingsItem[] = [
    {
      id: 'notifications-settings',
      label: 'Notificações',
      description: 'Bazes, comentários, seguidores',
      icon: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
      routeTo: '/notifications',
    },
  ];

  get adminItems(): SettingsItem[] {
    if (this.authService.currentUser()?.role !== 'administrador') {
      return [];
    }
    return [
      {
        id: 'admin',
        label: 'Administração',
        description: 'Utilizadores, publicações e comentários',
        icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
        routeTo: '/admin',
      },
    ];
  }

  // ── Itens — Suporte ──────────────────────────────────
  supportItems: SettingsItem[] = [
    {
      id: 'help',
      label: 'Ajuda',
      description: 'FAQ e contacto de suporte',
      icon: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
      routeTo: '/settings/help',
    },
    {
      id: 'about',
      label: 'Sobre o NzolaNet',
      description: 'Versão, licenças, créditos',
      icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
      routeTo: '/settings/about',
    },
  ];

  // ── Acções ───────────────────────────────────────────
  toggleDarkMode(): void {
    this.themeService.toggle();
  }

  onRowClick(item: SettingsItem): void {
    if (item.routeTo) {
      this.router.navigate([item.routeTo]);
    }
  }

  logout(): void {
    this.authService.logout();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  initials(name?: string): string {
    return name ? name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2) : 'NU';
  }

  username(name?: string): string {
    return (name || 'utilizador').toLowerCase().replace(/\s+/g, '_');
  }
}
