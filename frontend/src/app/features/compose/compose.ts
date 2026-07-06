import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../core/services/post.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiUrlService } from '../../core/services/api-url.service';
import { ToastService } from '../../core/services/toast.service';

interface MediaItem {
  type: 'image' | 'video';
  file: File;
  preview: string;
}

@Component({
  selector: 'nzola-compose',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compose.html',
  styleUrls: ['./compose.scss'],
  host: { class: 'block w-full' }
})
export class ComposeComponent {
  charCount = 0;
  content = '';
  mediaFiles: MediaItem[] = [];
  readonly MAX_MEDIA = 4;
  isPublishing = false;
  errorMessage = '';
  showDiscardModal = false;

  private router = inject(Router);
  private postService = inject(PostService);
  public authService = inject(AuthService);
  private apiUrl = inject(ApiUrlService);
  private cdr = inject(ChangeDetectorRef);
  private toastService = inject(ToastService);

  get canAddMore(): boolean {
    return this.mediaFiles.length < this.MAX_MEDIA;
  }

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.charCount = textarea.value.length;
  }

  onMediaSelected(event: Event, type: 'image' | 'video'): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const remaining = this.MAX_MEDIA - this.mediaFiles.length;

    files.slice(0, remaining).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.mediaFiles = [...this.mediaFiles, { type, file, preview: e.target?.result as string }];
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeMedia(index: number): void {
    this.mediaFiles = this.mediaFiles.filter((_, i) => i !== index);
    this.cdr.detectChanges();
  }

  publish(): void {
    this.errorMessage = '';

    if (!this.content.trim() && this.mediaFiles.length === 0) {
      this.toastService.warning('Atenção', 'Escreve algo ou adiciona imagens/vídeos para publicar.');
      return;
    }

    this.isPublishing = true;

    this.postService.create({
      content: this.content,
      media: this.mediaFiles.map(m => m.file),
    }).subscribe({
      next: () => {
        this.toastService.success('Publicado!', 'A tua publicação está no feed.');
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        const validation = err?.error?.errors;
        const firstMsg = validation && typeof validation === 'object'
          ? (Object.values(validation).flat()[0] as string)
          : null;
        this.errorMessage = firstMsg || err?.error?.message || 'Não foi possível publicar.';
        this.isPublishing = false;
        this.cdr.detectChanges();
      },
      complete: () => { this.isPublishing = false; }
    });
  }

  close(): void {
    if (this.content.trim() || this.mediaFiles.length > 0) {
      this.showDiscardModal = true;
    } else {
      this.router.navigate(['/home']);
    }
  }

  confirmDiscard(): void {
    this.showDiscardModal = false;
    this.router.navigate(['/home']);
  }

  cancelDiscard(): void {
    this.showDiscardModal = false;
  }

  photoUrl(path?: string | null): string | null {
    return this.apiUrl.storageUrl(path);
  }

  initials(name?: string): string {
    if (!name) return 'U';
    return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
  }
}
