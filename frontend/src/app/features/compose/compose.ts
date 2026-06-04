import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../core/services/post.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiUrlService } from '../../core/services/api-url.service';

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
  
  images: File[] = [];
  imagePreviews: string[] = [];
  maxImages = 10;
  
  videos: File[] = [];
  videoPreviews: string[] = [];
  maxVideos = 10;
  
  isPublishing = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private postService: PostService,
    public authService: AuthService,
    private apiUrl: ApiUrlService,
    private cdr: ChangeDetectorRef
  ) {}

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.charCount = textarea.value.length;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    
    if (!files || files.length === 0) return;
    
    const remainingSlots = this.maxImages - this.images.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);
    
    filesToAdd.forEach(file => {
      if (file.type.startsWith('image/')) {
        this.images.push(file);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews = [...this.imagePreviews, e.target?.result as string];
          this.cdr.detectChanges(); // Forçar atualização da view
        };
        reader.readAsDataURL(file);
      }
    });
    
    input.value = '';
  }

  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    
    if (!files || files.length === 0) return;
    
    const remainingSlots = this.maxVideos - this.videos.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);
    
    filesToAdd.forEach(file => {
      if (file.type.startsWith('video/')) {
        this.videos.push(file);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.videoPreviews = [...this.videoPreviews, e.target?.result as string];
          this.cdr.detectChanges(); // Forçar atualização da view
        };
        reader.readAsDataURL(file);
      }
    });
    
    input.value = '';
  }

  removeImage(index: number): void {
    this.images.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    this.cdr.detectChanges();
  }

  removeVideo(index: number): void {
    this.videos.splice(index, 1);
    this.videoPreviews.splice(index, 1);
    this.cdr.detectChanges();
  }

  clearAllMedia(): void {
    this.images = [];
    this.imagePreviews = [];
    this.videos = [];
    this.videoPreviews = [];
    this.cdr.detectChanges();
  }

  publish(): void {
    this.errorMessage = '';

    if (!this.content.trim() && this.images.length === 0 && this.videos.length === 0) {
      this.errorMessage = 'Escreve algo ou adiciona imagens/vídeos para publicar.';
      return;
    }

    this.isPublishing = true;
    
    const formData = new FormData();
    formData.append('content', this.content);
    
    // Enviar imagens
    this.images.forEach((image) => {
      formData.append('images[]', image);
    });
    
    // Enviar vídeos
    this.videos.forEach((video) => {
      formData.append('videos[]', video);
    });

    console.log('Enviando:', {
      content: this.content,
      imagesCount: this.images.length,
      videosCount: this.videos.length
    });

    this.postService.create(formData as any).subscribe({
      next: (response: any) => {
        console.log('Publicado com sucesso:', response);
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        console.error('Erro ao publicar:', err);
        this.errorMessage = err?.error?.message || 'Não foi possível publicar. Verifica se tens sessão iniciada.';
        this.isPublishing = false;
      },
      complete: () => {
        this.isPublishing = false;
      }
    });
  }

  close(): void {
    this.router.navigate(['/home']);
  }

  photoUrl(path?: string | null): string | null {
    return this.apiUrl.storageUrl(path);
  }

  initials(name?: string): string {
    return name ? name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2) : 'U';
  }
}