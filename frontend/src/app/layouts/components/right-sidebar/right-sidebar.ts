import { Component, OnInit } from '@angular/core';
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
  loading = true;
  users: UserWithFollow[] = [];

  constructor(
    private userService: UserService,
    private apiUrl: ApiUrlService
  ) {}

  ngOnInit(): void {
    this.loadSuggestions();
  }

  loadSuggestions(): void {
    this.loading = true;
    this.userService.list().subscribe({
      next: (users) => {
        this.users = users.slice(0, 5);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  toggleFollow(user: UserWithFollow): void {
    if (user.is_following) {
      this.userService.unfollow(user.id).subscribe({
        next: () => {
          user.is_following = false;
        }
      });
    } else {
      this.userService.follow(user.id).subscribe({
        next: () => {
          user.is_following = true;
        }
      });
    }
  }

  photoUrl(path?: string | null): string | null {
    return this.apiUrl.storageUrl(path);
  }

  initials(name?: string): string {
    if (!name) return '?';
    return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
  }
}