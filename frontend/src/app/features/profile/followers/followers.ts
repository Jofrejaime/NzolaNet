import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ApiUrlService } from '../../../core/services/api-url.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'nzola-followers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './followers.html',
  styleUrls: ['./followers.scss']
})
export class FollowersComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);
  apiUrl = inject(ApiUrlService);
  authService = inject(AuthService);

  followers: any[] = [];
  filteredFollowers: any[] = [];
  isLoading = false;
  searchTerm = '';
  errorMessage = '';

  ngOnInit(): void {
    this.loadFollowers();
  }

  loadFollowers(): void {
    this.isLoading = true;
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;
    
    this.userService.getFollowers(userId).subscribe({
      next: (data: any) => {
        this.followers = data;
        this.filteredFollowers = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erro ao carregar seguidores.';
        this.isLoading = false;
      }
    });
  }

  filterFollowers(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredFollowers = this.followers.filter(follower =>
      follower.name.toLowerCase().includes(term) ||
      (follower.username || '').toLowerCase().includes(term)
    );
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  goToProfile(userId: number): void {
    this.router.navigate(['/user', userId]);
  }

  photoUrl(path?: string): string | null {
    return this.apiUrl.storageUrl(path);
  }

  initials(name?: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}