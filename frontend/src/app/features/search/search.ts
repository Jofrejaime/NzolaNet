import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'nzola-search',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './search.html',
  styleUrls: ['./search.scss'],
  host: { class: 'block w-full' }
})
export class SearchComponent {
  searchQuery = '';

  trends = [
    { category: 'Tecnologia', tag: '#WebDev', posts: '12.5k' },
    { category: 'Design', tag: 'Figma Updates', posts: '8.2k' },
    { category: 'Angola', tag: '#Luanda', posts: '6.1k' },
    { category: 'Música', tag: '#Kuduro', posts: '4.8k' },
    { category: 'Desporto', tag: '#PrimeiraLiga', posts: '3.9k' },
  ];

  suggestions = [
    { name: 'Maria Costa', handle: 'mcoosta_ux', initials: 'MC', bio: 'UX Designer · Lisboa' },
    { name: 'TechNews PT', handle: 'technews_pt', initials: 'TN', bio: 'Notícias de tecnologia em PT' },
    { name: 'João Ferreira', handle: 'joaodev', initials: 'JF', bio: 'Full-stack developer · Porto' },
    { name: 'Ana Rodrigues', handle: 'ana_creates', initials: 'AR', bio: 'Fotografia & Arte Digital' },
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

  allUsers = [
    { name: 'Maria Costa', handle: 'mcoosta_ux', initials: 'MC' },
    { name: 'TechNews PT', handle: 'technews_pt', initials: 'TN' },
    { name: 'João Ferreira', handle: 'joaodev', initials: 'JF' },
    { name: 'Ana Rodrigues', handle: 'ana_creates', initials: 'AR' },
    { name: 'Design Daily', handle: 'designdaily', initials: 'DD' },
    { name: 'Ana Silva', handle: 'anasilva_dev', initials: 'AS' },
  ];

  filteredUsers: typeof this.allUsers = [];

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.searchQuery = value;
    if (value) {
      const lower = value.toLowerCase();
      this.filteredUsers = this.allUsers.filter(u =>
        u.name.toLowerCase().includes(lower) ||
        u.handle.toLowerCase().includes(lower)
      );
    } else {
      this.filteredUsers = [];
    }
  }
}