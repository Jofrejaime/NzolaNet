import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../core/services/post.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiUrlService } from '../../core/services/api-url.service';
import { ToastService } from '../../core/services/toast.service';

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
  maxImages = 4;
  
  videos: File[] = [];
  videoPreviews: string[] = [];
  maxVideos = 2;
  
  isPublishing = false;
  errorMessage = '';

  private router = inject(Router);
  private postService = inject(PostService);
  public authService = inject(AuthService);
  private apiUrl = inject(ApiUrlService);
  private cdr = inject(ChangeDetectorRef);
  private toastService = inject(ToastService);

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
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      }
    });
    
    input.value = '';
    
    if (filesToAdd.length > 0) {
      this.toastService.success('Imagens adicionadas!', `${filesToAdd.length} imagem(ns) selecionada(s).`);
    }
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
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      }
    });
    
    input.value = '';
    
    if (filesToAdd.length > 0) {
      this.toastService.success('Vídeos adicionados!', `${filesToAdd.length} vídeo(s) selecionado(s).`);
    }
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
    const imageCount = this.images.length;
    const videoCount = this.videos.length;
    
    this.images = [];
    this.imagePreviews = [];
    this.videos = [];
    this.videoPreviews = [];
    this.cdr.detectChanges();
    
    if (imageCount > 0 || videoCount > 0) {
      this.toastService.info('Limpo!', 'Todos os media foram removidos.');
    }
  }

  publish(): void {
    this.errorMessage = '';

    if (!this.content.trim() && this.images.length === 0 && this.videos.length === 0) {
      this.toastService.warning('Atenção', 'Escreve algo ou adiciona imagens/vídeos para publicar.');
      return;
    }

    this.isPublishing = true;
    
    // Enviar apenas a primeira imagem e o primeiro vídeo (o serviço pode não suportar múltiplos)
    const payload: any = {
      content: this.content
    };
    
    if (this.images.length > 0) {
      payload.image = this.images[0];
    }
    
    if (this.videos.length > 0) {
      payload.video = this.videos[0];
    }

    console.log('Publicando:', {
      content: this.content,
      hasImage: !!payload.image,
      hasVideo: !!payload.video
    });

    this.postService.create(payload).subscribe({
      next: (response: any) => {
        console.log('Publicado com sucesso:', response);
        this.toastService.success('Publicado!', 'A tua publicação está no feed.');
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        console.error('Erro detalhado:', err);
        const msg = err?.error?.message || err?.message || 'Não foi possível publicar. Tenta novamente.';
        this.toastService.error('Erro!', msg);
        this.errorMessage = msg;
        this.isPublishing = false;
      }
    });
  }

  close(): void {
    if (this.content.trim() || this.images.length > 0 || this.videos.length > 0) {
      if (confirm('Tens conteúdo não publicado. Descartar alterações?')) {
        this.router.navigate(['/home']);
      }
    } else {
      this.router.navigate(['/home']);
    }
  }

  photoUrl(path?: string | null): string | null {
    return this.apiUrl.storageUrl(path);
  }

  initials(name?: string): string {
    if (!name) return 'U';
    return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
  }
}