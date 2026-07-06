import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ApiUrlService } from '../../../core/services/api-url.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton';

@Component({
  selector: 'nzola-followers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SkeletonComponent],
  templateUrl: './followers.html',
  styleUrls: ['./followers.scss']
})
export class FollowersComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  apiUrl = inject(ApiUrlService);
  authService = inject(AuthService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  followers: any[] = [];
  filteredFollowers: any[] = [];
  isLoading = false;
  searchTerm = '';
  errorMessage = '';
  userId: number | null = null;
  skeletonItems = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    console.log('FollowersComponent inicializado');
    
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
        this.cdr.detectChanges();
      }
    });
  }

  loadFollowers(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    if (!this.userId) {
      this.errorMessage = 'Utilizador não identificado.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }
    
    this.userService.getFollowers(this.userId).subscribe({
      next: (data: any) => {
        console.log('Seguidores carregados:', data);
        this.followers = data;
        this.filteredFollowers = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Erro ao carregar seguidores:', error);
        this.errorMessage = 'Erro ao carregar seguidores.';
        this.isLoading = false;
        this.cdr.detectChanges();
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
    this.cdr.detectChanges();
  }

  isSelf(userId: number): boolean {
    return this.authService.currentUser()?.id === userId;
  }

  toggleFollow(follower: any, event: Event): void {
    event.stopPropagation();
    const isCurrentlyFollowingOrPending = follower.is_following || follower.is_follow_pending;

    const request = isCurrentlyFollowingOrPending
      ? this.userService.unfollow(follower.id)
      : this.userService.follow(follower.id);

    request.subscribe({
      next: () => {
        if (isCurrentlyFollowingOrPending) {
          follower.is_following = false;
          follower.is_follow_pending = false;
          this.toastService.success('Deixaste de seguir', follower.name);
        } else if (follower.is_private) {
          follower.is_follow_pending = true;
          this.toastService.success('Pedido enviado!', 'Aguarde a aprovação.');
        } else {
          follower.is_following = true;
          this.toastService.success('Seguindo!', `Agora segues ${follower.name}.`);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('Erro!', 'Não foi possível atualizar o seguimento.');
      }
    });
  }

  goBack(): void {
    if (this.userId) {
      this.router.navigate(['/profile', this.userId]);
    } else {
      this.router.navigate(['/profile']);
    }
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