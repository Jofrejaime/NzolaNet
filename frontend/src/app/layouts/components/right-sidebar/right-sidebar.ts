import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService, UserWithFollow } from '../../../core/services/user.service';
import { ApiUrlService } from '../../../core/services/api-url.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'nzola-right-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './right-sidebar.html',
  styleUrls: ['./right-sidebar.scss']
})
export class RightSidebarComponent implements OnInit {
  readonly loading = signal(true);
  readonly users = signal<UserWithFollow[]>([]);

  private router = inject(Router);
  private userService = inject(UserService);
  private apiUrl = inject(ApiUrlService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.loadSuggestions();
  }

  loadSuggestions(): void {
    this.loading.set(true);
    this.userService.list().subscribe({
      next: (users) => {
        // Filtrar o próprio utilizador das sugestões
        const currentUserId = this.authService.currentUser()?.id;
        const filteredUsers = users.filter(u => u.id !== currentUserId).slice(0, 5);
        this.users.set(filteredUsers);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  goToProfile(user: UserWithFollow): void {
    const ownId = this.authService.currentUser()?.id;
    if (ownId === user.id) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/profile', user.id]);
    }
  }

  toggleFollow(user: UserWithFollow, event: Event): void {
    event.stopPropagation(); // Evitar navegar para o perfil
    
    const isCurrentlyFollowingOrPending = user.is_following || user.is_follow_pending;

    const request = isCurrentlyFollowingOrPending
      ? this.userService.unfollow(user.id)
      : this.userService.follow(user.id);

    request.subscribe({
      next: () => {
        this.users.update((list) =>
          list.map((item) => {
            if (item.id === user.id) {
              if (isCurrentlyFollowingOrPending) {
                return { ...item, is_following: false, is_follow_pending: false };
              } else {
                if (item.is_private) {
                  return { ...item, is_follow_pending: true };
                } else {
                  return { ...item, is_following: true };
                }
              }
            }
            return item;
          })
        );
        
        if (isCurrentlyFollowingOrPending) {
          this.toastService.success('Deixaste de seguir', user.name);
        } else {
          if (user.is_private) {
            this.toastService.success('Pedido enviado!', 'Aguarde a aprovação.');
          } else {
            this.toastService.success('Agora segues', user.name);
          }
        }
      },
      error: (err) => {
        console.error('Erro ao atualizar seguir:', err);
        this.toastService.error('Erro!', 'Não foi possível atualizar o seguimento.');
      }
    });
  }

  photoUrl(path?: string | null): string | null {
    return this.apiUrl.storageUrl(path);
  }

  initials(name?: string): string {
    if (!name) return '?';
    return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
  }
}