import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiUrlService } from '../../../core/services/api-url.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';

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

  // Modal states
  showDeactivateModal = false;
  showDeleteModal = false;
  confirmPassword = '';
  confirmText = '';
  isProcessing = false;
  modalError = '';

  user = {
    name: '',
    email: '',
    bio: '',
    is_private: false,
    profile_photo: null as string | null,
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private apiUrl: ApiUrlService,
    private toastService: ToastService
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

  // Modal methods
  openDeactivateModal(): void {
    this.showDeactivateModal = true;
    this.confirmPassword = '';
    this.modalError = '';
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
    this.confirmPassword = '';
    this.confirmText = '';
    this.modalError = '';
  }

  closeModals(): void {
    this.showDeactivateModal = false;
    this.showDeleteModal = false;
    this.confirmPassword = '';
    this.confirmText = '';
    this.modalError = '';
    this.isProcessing = false;
  }

  deactivateAccount(): void {
    if (!this.confirmPassword.trim()) {
      this.modalError = 'Digita a tua palavra-passe para confirmar.';
      return;
    }

    this.isProcessing = true;
    this.modalError = '';

    this.userService.deactivateAccount(this.confirmPassword).subscribe({
      next: () => {
        this.toastService.info('Conta desativada', 'O teu perfil ficou oculto. Podes reativar fazendo login.');
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.modalError = error?.error?.message || 'Palavra-passe incorreta.';
        this.isProcessing = false;
      }
    });
  }

  deleteAccount(): void {
    if (this.confirmText !== 'ELIMINAR') {
      this.modalError = 'Digita ELIMINAR para confirmar a eliminação.';
      return;
    }

    if (!this.confirmPassword.trim()) {
      this.modalError = 'Digita a tua palavra-passe para confirmar.';
      return;
    }

    this.isProcessing = true;
    this.modalError = '';

    this.userService.deleteAccount(this.confirmPassword).subscribe({
      next: () => {
        this.toastService.success('Conta eliminada', 'A tua conta foi removida permanentemente.');
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.modalError = error?.error?.message || 'Palavra-passe incorreta.';
        this.isProcessing = false;
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