import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'nzola-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss'],
  host: { class: 'block w-full' }
})
export class ResetPasswordComponent implements OnInit {
  form = {
    password: '',
    password_confirmation: '',
  };

  email = '';
  token = '';
  showPassword = false;
  showConfirm = false;

  isLoading = signal(false);
  errorMessage = signal('');
  success = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';

    if (!this.token || !this.email) {
      this.errorMessage.set('Link inválido. Solicita um novo link de recuperação.');
    }
  }

  submit(): void {
    this.errorMessage.set('');

    if (!this.form.password || this.form.password.length < 8) {
      this.errorMessage.set('A palavra-passe deve ter pelo menos 8 caracteres.');
      return;
    }

    if (this.form.password !== this.form.password_confirmation) {
      this.errorMessage.set('As palavras-passe não coincidem.');
      return;
    }

    this.isLoading.set(true);

    this.authService
      .resetPassword(this.email, this.token, this.form.password, this.form.password_confirmation)
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.success.set(true);
          this.toast.success('Sucesso!', 'Palavra-passe redefinida. Podes fazer login agora.');
        },
        error: (err) => {
          this.isLoading.set(false);
          const errors = err?.error?.errors;
          const msg =
            errors?.token?.[0] ||
            errors?.password?.[0] ||
            errors?.email?.[0] ||
            err?.error?.message ||
            'Não foi possível redefinir a palavra-passe.';
          this.errorMessage.set(msg);
        },
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
