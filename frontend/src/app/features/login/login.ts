import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'nzola-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  host: { class: 'block w-full' }
})
export class LoginComponent {
  activeTab: 'entrar' | 'criar' | 'forgot' = 'entrar';
  isLoading = false;
  errorMessage = '';

  // Show/hide password toggles
  showLoginPassword = false;
  showRegisterPassword = false;
  showRegisterConfirm = false;

  // Forgot password state
  forgotEmail = '';
  forgotLoading = false;
  forgotSuccess = false;
  forgotError = '';

  loginForm = {
    email: '',
    password: '',
    remember_me: false
  };

  registerForm = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    bio: '',
    is_private: false,
    terms: false
  };

  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  login(): void {
    if (this.isLoading) return;
    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login(this.loginForm).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.success('Bem-vindo!', 'Login realizado com sucesso.');
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.isLoading = false;
        const msg = error?.error?.message || this.firstValidationError(error) || 'Email ou palavra-passe incorrectos.';
        this.errorMessage = msg;
      }
    });
  }

  register(): void {
    this.errorMessage = '';

    if (!this.registerForm.terms) {
      const msg = 'Aceita os termos para criar a conta.';
      this.errorMessage = msg;
      this.toastService.warning('Atenção!', msg);
      return;
    }

    if (this.registerForm.password !== this.registerForm.password_confirmation) {
      const msg = 'As palavras-passe não coincidem.';
      this.errorMessage = msg;
      this.toastService.warning('Atenção!', msg);
      return;
    }

    if (this.registerForm.password.length < 8) {
      const msg = 'A palavra-passe deve ter pelo menos 8 caracteres.';
      this.errorMessage = msg;
      this.toastService.warning('Atenção!', msg);
      return;
    }

    this.isLoading = true;

    this.authService.register({
      name: this.registerForm.name,
      email: this.registerForm.email,
      password: this.registerForm.password,
      password_confirmation: this.registerForm.password_confirmation,
      bio: this.registerForm.bio || undefined,
      is_private: this.registerForm.is_private
    }).subscribe({
      next: () => {
        this.toastService.success('Conta criada!', 'Bem-vindo ao NzolaNet.');
        this.router.navigate(['/home']);
      },
      error: (error) => {
        const msg = error?.error?.message || this.firstValidationError(error) || 'Não foi possível criar a conta.';
        this.errorMessage = msg;
        this.toastService.error('Erro!', msg);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  sendRecovery(): void {
    this.forgotError = '';

    if (!this.forgotEmail || !this.forgotEmail.includes('@')) {
      this.forgotError = 'Insere um email válido.';
      return;
    }

    this.forgotLoading = true;

    this.authService.recoverPassword(this.forgotEmail).subscribe({
      next: () => {
        this.forgotLoading = false;
        this.forgotSuccess = true;
      },
      error: (err) => {
        this.forgotLoading = false;
        const errors = err?.error?.errors;
        this.forgotError =
          errors?.email?.[0] ||
          err?.error?.message ||
          'Não foi possível processar o pedido.';
      }
    });
  }

  switchToLogin(): void {
    this.activeTab = 'entrar';
    this.errorMessage = '';
    this.forgotError = '';
    this.forgotSuccess = false;
    this.forgotEmail = '';
  }

  switchToRegister(): void {
    this.activeTab = 'criar';
    this.errorMessage = '';
  }

  switchToForgot(): void {
    this.activeTab = 'forgot';
    this.errorMessage = '';
    this.forgotError = '';
    this.forgotSuccess = false;
    this.forgotEmail = '';
  }

  private firstValidationError(error: any): string | null {
    const errors = error?.error?.errors;
    if (!errors) return null;
    const firstKey = Object.keys(errors)[0];
    return firstKey ? errors[firstKey][0] : null;
  }
}
