import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // ✅ Adicionar RouterModule
import { UserService } from '../../../core/services/user.service';
import { ApiUrlService } from '../../../core/services/api-url.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service'; // ✅ Adicionar
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton'; // ✅ Adicionar

@Component({
  selector: 'nzola-following',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SkeletonComponent], // ✅ Adicionar RouterModule e SkeletonComponent
  templateUrl: './following.html',
  styleUrls: ['./following.scss']
})
export class FollowingComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  apiUrl = inject(ApiUrlService);
  authService = inject(AuthService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef); // ✅ Adicionar

  following: any[] = [];
  filteredFollowing: any[] = [];
  isLoading = false;
  searchTerm = '';
  errorMessage = '';
  userId: number | null = null; // ✅ Armazenar userId
  skeletonItems = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    console.log('FollowingComponent inicializado');
    
    // ✅ Usar params para capturar mudanças na rota
    this.route.params.subscribe(params => {
      console.log('Parâmetros da rota:', params);
      this.userId = params['id'] ? Number(params['id']) : null;
      
      // Se não tiver userId na rota, pegar do usuário autenticado
      if (!this.userId) {
        this.userId = this.authService.currentUser()?.id || null;
      }
      
      console.log('UserId final:', this.userId);
      
      if (this.userId) {
        this.loadFollowing();
      } else {
        this.errorMessage = 'Utilizador não encontrado.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadFollowing(): void {
    this.isLoading = true;
    this.cdr.detectChanges(); // ✅ Forçar atualização do loading
    
    if (!this.userId) {
      this.errorMessage = 'Utilizador não identificado.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }
    
    this.userService.getFollowing(this.userId).subscribe({
      next: (data: any) => {
        console.log('Seguindo carregados:', data);
        this.following = data;
        this.filteredFollowing = data;
        this.isLoading = false;
        this.cdr.detectChanges(); // ✅ Forçar atualização da UI
      },
      error: (error: any) => {
        console.error('Erro ao carregar seguindo:', error);
        this.errorMessage = 'Erro ao carregar seguindo.';
        this.isLoading = false;
        this.cdr.detectChanges(); // ✅ Forçar atualização
        this.toastService.error('Erro!', 'Não foi possível carregar a lista de seguindo.');
      }
    });
  }

  filterFollowing(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredFollowing = this.following.filter(user =>
      user.name.toLowerCase().includes(term) ||
      (user.username || '').toLowerCase().includes(term)
    );
    this.cdr.detectChanges(); // ✅ Forçar atualização
  }

  isSelf(userId: number): boolean {
    return this.authService.currentUser()?.id === userId;
  }

  toggleFollow(user: any, event: Event): void {
    event.stopPropagation();
    const isCurrentlyFollowingOrPending = user.is_following || user.is_follow_pending;

    const request = isCurrentlyFollowingOrPending
      ? this.userService.unfollow(user.id)
      : this.userService.follow(user.id);

    request.subscribe({
      next: () => {
        if (isCurrentlyFollowingOrPending) {
          user.is_following = false;
          user.is_follow_pending = false;
          this.toastService.success('Deixaste de seguir', user.name);
        } else if (user.is_private) {
          user.is_follow_pending = true;
          this.toastService.success('Pedido enviado!', 'Aguarde a aprovação.');
        } else {
          user.is_following = true;
          this.toastService.success('Seguindo!', `Agora segues ${user.name}.`);
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