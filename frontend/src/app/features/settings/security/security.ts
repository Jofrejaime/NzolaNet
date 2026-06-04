import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'nzola-security',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './security.html',
  styleUrls: ['./security.scss']
})
export class SecurityComponent {
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  isSaving = signal(false);
  errorMessage = signal('');

  constructor(
    private router: Router,
    private userService: UserService,
    private toast: ToastService
  ) {}

  updatePassword(): void {
    this.errorMessage.set('');

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage.set('As palavras-passe não coincidem.');
      return;
    }

    this.isSaving.set(true);
    this.userService
      .changePassword(
        this.passwordData.currentPassword,
        this.passwordData.newPassword,
        this.passwordData.confirmPassword
      )
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.toast.success('Sucesso', 'Palavra-passe alterada.');
          this.router.navigate(['/settings']);
        },
        error: (err) => {
          this.isSaving.set(false);
          const validation = err?.error?.errors;
          const msg =
            validation?.current_password?.[0] ||
            validation?.password?.[0] ||
            err?.error?.message ||
            'Não foi possível alterar a palavra-passe.';
          this.errorMessage.set(msg);
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/settings']);
  }
}
