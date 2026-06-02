import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Comment, Post } from '../../core/models/api.models';
import { ApiUrlService } from '../../core/services/api-url.service';
import { CommentService } from '../../core/services/comment.service';
import { PostService } from '../../core/services/post.service';

@Component({
  selector: 'nzola-thread',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './thread.html',
  styleUrls: ['./thread.scss'],
  host: { class: 'block w-full' }
})
export class ThreadComponent implements OnInit {
  post: Post | null = null;
  comments: Comment[] = [];
  commentContent = '';
  isLoading = false;
  isCommenting = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private postService: PostService,
    private commentService: CommentService,
    private apiUrl: ApiUrlService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage = 'Publicacao invalida.';
      return;
    }

    this.loadThread(id);
  }

  loadThread(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.postService.show(id).subscribe({
      next: (post) => {
        this.post = post;
        this.loadComments(post.id);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Nao foi possivel carregar a publicacao.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  loadComments(postId: number): void {
    this.commentService.list(postId).subscribe({
      next: (page) => {
        this.comments = page.data;
      }
    });
  }

  publishComment(): void {
    if (!this.post || !this.commentContent.trim()) {
      return;
    }

    this.isCommenting = true;
    this.commentService.create(this.post.id, this.commentContent.trim()).subscribe({
      next: (comment) => {
        this.comments = [comment, ...this.comments];
        this.commentContent = '';
        this.post = {
          ...this.post!,
          comments_count: (this.post?.comments_count || 0) + 1
        };
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Nao foi possivel comentar.';
        this.isCommenting = false;
      },
      complete: () => {
        this.isCommenting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  initials(name?: string): string {
    return name ? name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2) : '?';
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

    const minutes = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 60000));

    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    return hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`;
  }
}
