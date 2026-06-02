import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  theme = signal<'dark' | 'light'>('dark');

  constructor() {
    // Inicializar o tema
    this.init();
    
    // Efeito para aplicar o tema sempre que mudar
    effect(() => {
      const currentTheme = this.theme();
      document.documentElement.setAttribute('data-theme', currentTheme);
      localStorage.setItem('nzola-theme', currentTheme);
    });
  }

  init(): void {
    const saved = localStorage.getItem('nzola-theme') as 'dark' | 'light' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (saved) {
      this.theme.set(saved);
    } else {
      this.theme.set(prefersDark ? 'dark' : 'light');
    }
  }

  toggle(): void {
    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: 'dark' | 'light'): void {
    this.theme.set(theme);
  }
}