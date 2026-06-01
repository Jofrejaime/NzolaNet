import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nzola-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-[var(--bg-overlay)]"
      [style.width]="sizePx()"
      [style.height]="sizePx()">
      @if (src) {
        <img [src]="src" [alt]="alt" class="w-full h-full object-cover">
      } @else {
        <div class="w-full h-full flex items-center justify-center text-[0.4em] font-semibold text-[var(--text-secondary)] bg-[var(--bg-elevated)]">
          {{ initials() }}
        </div>
      }
    </div>
  `
})
export class AvatarComponent {
  @Input() src?: string;
  @Input() alt = 'Avatar';
  @Input() name = '';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';

  sizeMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80
  };

  sizePx() {
    return `${this.sizeMap[this.size]}px`;
  }

  initials() {
    if (!this.name) return '?';
    return this.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}