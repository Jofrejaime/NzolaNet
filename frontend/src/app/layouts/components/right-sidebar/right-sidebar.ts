import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UserWithFollow } from '../../../core/services/user.service';
import { ApiUrlService } from '../../../core/services/api-url.service';

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

  constructor(
    private userService: UserService,
    private apiUrl: ApiUrlService
  ) {}

  ngOnInit(): void {
    this.loadSuggestions();
  }

  loadSuggestions(): void {
    this.loading.set(true);
    this.userService.list().subscribe({
      next: (users) => {
        this.users.set(users.slice(0, 5));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  toggleFollow(user: UserWithFollow): void {
    const request = user.is_following
      ? this.userService.unfollow(user.id)
      : this.userService.follow(user.id);

    request.subscribe({
      next: () => {
        this.users.update((list) =>
          list.map((item) =>
            item.id === user.id
              ? { ...item, is_following: !user.is_following }
              : item
          )
        );
      },
      error: (err) => {
        console.error('Erro ao atualizar seguir:', err);
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
