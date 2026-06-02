import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../core/services/post.service';

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
  imageFile: File | null = null;
  videoFile: File | null = null;
  isPublishing = false;
  errorMessage = '';

  constructor(private router: Router, private postService: PostService) {}

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.charCount = textarea.value.length;
  }

  onFileSelected(event: Event, type: 'image' | 'video'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    if (type === 'image') {
      this.imageFile = file;
    } else {
      this.videoFile = file;
    }
  }

  publish(): void {
    this.errorMessage = '';

    if (!this.content.trim() && !this.imageFile && !this.videoFile) {
      this.errorMessage = 'Escreve algo ou adiciona uma imagem/video para publicar.';
      return;
    }

    this.isPublishing = true;
    this.postService.create({
      content: this.content,
      image: this.imageFile,
      video: this.videoFile
    }).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Nao foi possivel publicar. Verifica se tens sessao iniciada.';
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
}
