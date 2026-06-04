import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts = signal<Toast[]>([]);
  private nextId = 0;

  getToasts() {
    return this.toasts();
  }

  show(title: string, message?: string, type: Toast['type'] = 'info', duration: number = 3000): void {
    const id = this.nextId++;
    const toast: Toast = { id, title, message, type, duration };
    
    this.toasts.update(list => [...list, toast]);
    
    setTimeout(() => {
      this.hide(id);
    }, duration);
  }

  success(title: string, message?: string, duration?: number): void {
    this.show(title, message, 'success', duration);
  }

  error(title: string, message?: string, duration?: number): void {
    this.show(title, message, 'error', duration);
  }

  info(title: string, message?: string, duration?: number): void {
    this.show(title, message, 'info', duration);
  }

  warning(title: string, message?: string, duration?: number): void {
    this.show(title, message, 'warning', duration);
  }

  hide(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}