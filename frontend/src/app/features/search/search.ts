import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // ✅ Adicionar ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // ✅ Adicionar RouterModule
import { UserService, UserWithFollow } from '../../core/services/user.service';
import { ApiUrlService } from '../../core/services/api-url.service';
import { ToastService } from '../../core/services/toast.service';
import { ExploreService, Trend } from '../../core/services/explore.service';
import { Post } from '../../core/models/api.models';
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

  trends: Trend[] = [];
  popularPosts: Post[] = [];
  loadingExplore = false;

  constructor(
    private userService: UserService,
    private apiUrl: ApiUrlService,
    private router: Router,
    private toastService: ToastService,
    private exploreService: ExploreService,
    private cdr: ChangeDetectorRef // ✅ Adicionar
  ) {}

  ngOnInit(): void {
    this.loadInitialUsers();
    this.loadExploreData();
  }

  loadExploreData(): void {
    this.loadingExplore = true;
    
    this.exploreService.getTrends().subscribe({
      next: (trends) => {
        this.trends = trends;
        this.cdr.detectChanges();
      }
    });

    this.exploreService.getPopularPosts().subscribe({
      next: (postsPage) => {
        this.popularPosts = postsPage.data;
        this.loadingExplore = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingExplore = false;
        this.cdr.detectChanges();
      }
    });
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
    const isCurrentlyFollowingOrPending = user.is_following || user.is_follow_pending;

    if (isCurrentlyFollowingOrPending) {
      this.userService.unfollow(user.id).subscribe({
        next: () => {
          user.is_following = false;
          user.is_follow_pending = false;
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
          if (user.is_private) {
            user.is_follow_pending = true;
            this.toastService.success('Pedido enviado!', 'Aguarde a aprovação.');
          } else {
            user.is_following = true;
            this.toastService.success('Seguindo!', `Agora segues ${user.name}.`);
          }
          this.cdr.detectChanges(); // ✅ Atualizar botão imediatamente
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

  goToPost(post: Post): void {
    this.router.navigate(['/post', post.id]);
  }

  photoUrl(path?: string | null): string | null {
    return this.apiUrl.storageUrl(path);
  }

  mediaUrl(path?: string | null): string | null {
    return this.apiUrl.storageUrl(path);
  }

  initials(name?: string): string {
    if (!name) return '?';
    return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
  }
}