import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiUrlService } from '../../../core/services/api-url.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'nzola-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account.html',
  styleUrls: ['./account.scss']
})
export class AccountComponent {
  isLoading = signal(false);
  savedMessage = signal('');
  errorMessage = signal('');

  user = {
    name: '',
    email: '',
    phone: '+244 923 456 789',
    bio: '',
    website: 'https://nzolanet.com',
    location: 'Luanda, Angola',
    birthDate: '1990-01-01',
    is_private: false,
    profile_photo: null as string | null
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private apiUrl: ApiUrlService
  ) {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.fillUser(currentUser);
    }

    this.authService.loadUser().subscribe({
      next: (user) => this.fillUser(user)
    });
  }

  saveChanges(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userService.updateProfile({
      name: this.user.name,
      bio: this.user.bio,
      is_private: this.user.is_private
    }).subscribe({
      next: () => {
        this.authService.loadUser().subscribe();
        this.savedMessage.set('Alteracoes guardadas com sucesso!');
        setTimeout(() => this.savedMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'Nao foi possivel guardar as alteracoes.');
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userService.uploadProfilePhoto(file).subscribe({
      next: (user) => {
        this.user.profile_photo = user.profile_photo || null;
        this.authService.loadUser().subscribe();
        this.savedMessage.set('Foto atualizada com sucesso!');
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'Nao foi possivel atualizar a foto.');
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/settings']);
  }

  photoUrl(): string | null {
    return this.apiUrl.storageUrl(this.user.profile_photo);
  }

  initials(): string {
    return this.user.name ? this.user.name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2) : 'NU';
  }

  private fillUser(user: any): void {
    this.user.name = user.name || '';
    this.user.email = user.email || '';
    this.user.bio = user.bio || '';
    this.user.is_private = !!user.is_private;
    this.user.profile_photo = user.profile_photo || null;
  }
}
