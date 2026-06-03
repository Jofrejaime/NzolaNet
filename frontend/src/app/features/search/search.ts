import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService, UserWithFollow } from '../../core/services/user.service';
import { ApiUrlService } from '../../core/services/api-url.service';

@Component({
  selector: 'nzola-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search.html',
  styleUrls: ['./search.scss'],
  host: { class: 'block w-full' }
})
export class SearchComponent implements OnInit {
  searchQuery = '';
  filteredUsers: UserWithFollow[] = [];
  allUsers: UserWithFollow[] = [];
  loading = false;

  trends = [
    { category: 'Tecnologia', tag: '#WebDev', posts: '12.5k' },
    { category: 'Design', tag: 'Figma Updates', posts: '8.2k' },
    { category: 'Angola', tag: '#Luanda', posts: '6.1k' },
    { category: 'Música', tag: '#Kuduro', posts: '4.8k' },
    { category: 'Desporto', tag: '#PrimeiraLiga', posts: '3.9k' },
  ];

  popularPosts = [
    { id: 1, emoji: '🌅', likes: '2.1k', comments: '34' },
    { id: 2, emoji: '💻', likes: '1.8k', comments: '22' },
    { id: 3, emoji: '🎨', likes: '3.4k', comments: '61' },
    { id: 4, emoji: '🏙️', likes: '980', comments: '15' },
    { id: 5, emoji: '🎵', likes: '2.6k', comments: '47' },
    { id: 6, emoji: '📸', likes: '1.2k', comments: '28' },
    { id: 7, emoji: '🌿', likes: '890', comments: '12' },
    { id: 8, emoji: '🚀', likes: '4.1k', comments: '83' },
    { id: 9, emoji: '🎭', likes: '1.5k', comments: '19' },
  ];

  constructor(
    private userService: UserService,
    private apiUrl: ApiUrlService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInitialUsers();
  }

  loadInitialUsers(): void {
    this.loading = true;
    this.userService.list().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.searchQuery = value;
    if (value) {
      this.loading = true;
      this.userService.list(value).subscribe({
        next: (users) => {
          this.filteredUsers = users;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      this.filteredUsers = [];
    }
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

  goToProfile(user: UserWithFollow): void {
    // Future: navigate to user profile
    this.router.navigate(['/profile']);
  }
}