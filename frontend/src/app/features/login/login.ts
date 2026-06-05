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
  activeTab: 'entrar' | 'criar' = 'entrar';
  isLoading = false;
  errorMessage = '';

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

  switchToLogin(): void {
    this.activeTab = 'entrar';
    this.errorMessage = '';
  }

  switchToRegister(): void {
    this.activeTab = 'criar';
    this.errorMessage = '';
  }

  private firstValidationError(error: any): string | null {
    const errors = error?.error?.errors;

    if (!errors) {
      return null;
    }

    const firstKey = Object.keys(errors)[0];
    return firstKey ? errors[firstKey][0] : null;
  }
}