import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post } from '../../core/models/api.models';
import { ApiUrlService } from '../../core/services/api-url.service';
import { PostService } from '../../core/services/post.service';

@Component({
  selector: 'nzola-feed',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './feed.html',
  styleUrls: ['./feed.scss'],
  host: { class: 'block w-full' }
})
export class FeedComponent implements OnInit {
 posts: Post[] = [];
 isLoading = false;
 errorMessage = '';

 waveform: number[] = [
    6, 10, 16, 22, 18, 28, 12, 20, 26, 14,
    8,  24, 20, 30, 16, 10, 28, 22, 18, 12,
    26, 8,  20, 14, 30, 18, 10, 24, 16, 22,
  ];

  constructor(
    private postService: PostService,
    private apiUrl: ApiUrlService
  ) {}

  ngOnInit(): void {
    this.loadFeed();
  }

  loadFeed(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.postService.list().subscribe({
      next: (page) => {
        this.posts = page.data;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Nao foi possivel carregar o feed. Confirma se o Laravel esta a correr em http://localhost:8000.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  initials(name?: string): string {
    if (!name) {
      return '?';
    }

    return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
  }

  username(name?: string): string {
    return (name || 'utilizador').toLowerCase().replace(/\s+/g, '_');
  }

  mediaUrl(path?: string | null): string | null {
    return this.apiUrl.storageUrl(path);
  }

  relativeTime(date?: string): string {
    if (!date) {
      return 'agora';
    }

    const diffMs = Date.now() - new Date(date).getTime();
    const minutes = Math.max(1, Math.floor(diffMs / 60000));

    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h`;
    }

    return `${Math.floor(hours / 24)}d`;
  }
}
