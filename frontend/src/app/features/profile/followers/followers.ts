import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ApiUrlService } from '../../../core/services/api-url.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton';

@Component({
  selector: 'nzola-followers',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonComponent, RouterLink],
  templateUrl: './followers.html',
  styleUrls: ['./followers.scss']
})
export class FollowersComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  apiUrl = inject(ApiUrlService);
  authService = inject(AuthService);
  private toastService = inject(ToastService);

  followers: any[] = [];
  filteredFollowers: any[] = [];
  isLoading = false;
  searchTerm = '';
  errorMessage = '';
  userId: number | null = null;
  skeletonItems = [1, 2, 3, 4, 5];

  ngOnInit(): void {
  console.log('FollowersComponent inicializado');
  
  // Obter o ID da rota
  this.route.params.subscribe(params => {
    console.log('Parâmetros da rota:', params);
    this.userId = params['id'] ? Number(params['id']) : null;
    
    if (!this.userId) {
      this.userId = this.authService.currentUser()?.id || null;
    }
    
    console.log('UserId final:', this.userId);
    
    if (this.userId) {
      this.loadFollowers();
    } else {
      this.errorMessage = 'Utilizador não encontrado.';
      this.isLoading = false;
    }
  });
}

  loadFollowers(): void {
    this.isLoading = true;
    const paramId = this.route.snapshot.paramMap.get('id');
    const userId = paramId ? Number(paramId) : this.authService.currentUser()?.id;
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
        this.toastService.error('Erro!', 'Não foi possível carregar os seguidores.');
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
    this.router.navigate(['/profile', this.userId]);
  }

  goToProfile(userId: number): void {
    const ownId = this.authService.currentUser()?.id;
    if (ownId === userId) {
      this.router.navigate(['/profile']);
      return;
    }
    this.router.navigate(['/profile', userId]);
  }

  photoUrl(path?: string): string | null {
    return this.apiUrl.storageUrl(path);
  }

  initials(name?: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}