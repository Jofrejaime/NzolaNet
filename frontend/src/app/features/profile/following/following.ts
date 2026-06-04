import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ApiUrlService } from '../../../core/services/api-url.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'nzola-following',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './following.html',  // Corrigido: following.html
  styleUrls: ['./following.scss']
})
export class FollowingComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);
  apiUrl = inject(ApiUrlService);
  authService = inject(AuthService);

  following: any[] = [];
  filteredFollowing: any[] = [];
  isLoading = false;
  searchTerm = '';
  errorMessage = '';

  ngOnInit(): void {
    this.loadFollowing();
  }

  loadFollowing(): void {
    this.isLoading = true;
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;
    
    this.userService.getFollowing(userId).subscribe({
      next: (data: any) => {
        this.following = data;
        this.filteredFollowing = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erro ao carregar seguindo.';
        this.isLoading = false;
      }
    });
  }

  filterFollowing(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredFollowing = this.following.filter(user =>
      user.name.toLowerCase().includes(term) ||
      (user.username || '').toLowerCase().includes(term)
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