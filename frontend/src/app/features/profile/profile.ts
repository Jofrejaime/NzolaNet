import { Component, OnInit, inject, ChangeDetectorRef, ApplicationRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../shared/components/avatar/avatar';
import { Router, RouterLink } from '@angular/router';
import { Post, NzolaUser } from '../../core/models/api.models';
import { ApiUrlService } from '../../core/services/api-url.service';
import { AuthService } from '../../core/services/auth.service';
import { PostService } from '../../core/services/post.service';

@Component({
  selector: 'nzola-profile',
  standalone: true,
  imports: [CommonModule, AvatarComponent, RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private postService = inject(PostService);
  private apiUrl = inject(ApiUrlService);
  private cdr = inject(ChangeDetectorRef);
  private appRef = inject(ApplicationRef);
  private ngZone = inject(NgZone);

  activeTab: 'posts' | 'replies' | 'highlights' | 'media' = 'posts';
  user: NzolaUser | null = this.authService.currentUser();
  posts: Post[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.ngZone.run(() => {
      this.isLoading = true;
      this.errorMessage = '';
    });

    this.authService.loadUser().subscribe({
      next: (user) => {
        this.ngZone.run(() => {
          this.user = user;
          this.cdr.detectChanges();
          this.loadPosts(user.id);
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel carregar o perfil.';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  loadPosts(userId: number): void {
    this.postService.list().subscribe({
      next: (page) => {
        this.ngZone.run(() => {
          this.posts = [...page.data.filter((post) => post.user_id === userId)];
          this.isLoading = false;
          this.cdr.detectChanges();
          this.appRef.tick();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.errorMessage = error?.error?.message || 'Nao foi possivel carregar as publicacoes.';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  goToAccount(): void {
    this.router.navigate(['/settings/account']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  photoUrl(path?: string | null): string | null {
    return this.apiUrl.storageUrl(path);
  }

  username(): string {
    return (this.user?.name || 'utilizador').toLowerCase().replace(/\s+/g, '_');
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