import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // ✅ Adicionar ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // ✅ Adicionar RouterModule
import { UserService, UserWithFollow } from '../../core/services/user.service';
import { ApiUrlService } from '../../core/services/api-url.service';
import { ToastService } from '../../core/services/toast.service';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';

@Component({
  selector: 'nzola-search',
  standalone: true,
  imports: [CommonModule, SkeletonComponent, RouterModule], // ✅ Adicionar RouterModule para routerLink
  templateUrl: './search.html',
  styleUrls: ['./search.scss'],
  host: { class: 'block w-full' }
})
export class SearchComponent implements OnInit {
  searchQuery = '';
  filteredUsers: UserWithFollow[] = [];
  allUsers: UserWithFollow[] = [];
  loading = false;
  isSearching = false;
  skeletonItems = [1, 2, 3, 4, 5];

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
    private router: Router,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef // ✅ Adicionar
  ) {}

  ngOnInit(): void {
    this.loadInitialUsers();
  }

  loadInitialUsers(): void {
    this.loading = true;
    this.cdr.detectChanges(); // ✅ Forçar atualização do loading
    
    this.userService.list().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.loading = false;
        this.cdr.detectChanges(); // ✅ Forçar atualização da UI
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges(); // ✅ Forçar atualização
        this.toastService.error('Erro!', 'Não foi possível carregar sugestões.');
      }
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.searchQuery = value;
    this.cdr.detectChanges(); // ✅ Forçar atualização do estado
    
    if (value) {
      this.isSearching = true;
      this.cdr.detectChanges(); // ✅ Mostrar skeleton imediatamente
      
      this.userService.list(value).subscribe({
        next: (users) => {
          this.filteredUsers = users;
          this.isSearching = false;
          this.cdr.detectChanges(); // ✅ Forçar atualização dos resultados
        },
        error: () => {
          this.isSearching = false;
          this.cdr.detectChanges(); // ✅ Forçar atualização
          this.toastService.error('Erro!', 'Erro ao pesquisar utilizadores.');
        }
      });
    } else {
      this.filteredUsers = [];
      this.cdr.detectChanges(); // ✅ Limpar resultados imediatamente
    }
  }

  toggleFollow(user: UserWithFollow): void {
    if (user.is_following) {
      this.userService.unfollow(user.id).subscribe({
        next: () => {
          user.is_following = false;
          this.cdr.detectChanges(); // ✅ Atualizar botão imediatamente
          this.toastService.info('Deixaste de seguir', user.name);
        },
        error: () => {
          this.toastService.error('Erro!', 'Não foi possível deixar de seguir.');
        }
      });
    } else {
      this.userService.follow(user.id).subscribe({
        next: () => {
          user.is_following = true;
          this.cdr.detectChanges(); // ✅ Atualizar botão imediatamente
          this.toastService.success('Seguindo!', `Agora segues ${user.name}.`);
        },
        error: () => {
          this.toastService.error('Erro!', 'Não foi possível seguir.');
        }
      });
    }
  }

  goToUserProfile(user: UserWithFollow): void {
    this.router.navigate(['/profile', user.id]);
  }

  photoUrl(path?: string | null): string | null {
    return this.apiUrl.storageUrl(path);
  }

  initials(name?: string): string {
    if (!name) return '?';
    return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
  }
}