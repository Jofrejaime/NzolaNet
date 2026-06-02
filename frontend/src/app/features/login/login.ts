import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

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

  constructor(private router: Router, private authService: AuthService) {}

  login(): void {
    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login(this.loginForm).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Nao foi possivel entrar. Verifica os dados e tenta novamente.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  register(): void {
    this.errorMessage = '';

    if (!this.registerForm.terms) {
      this.errorMessage = 'Aceita os termos para criar a conta.';
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
      next: () => this.router.navigate(['/home']),
      error: (error) => {
        this.errorMessage = error?.error?.message || this.firstValidationError(error) || 'Nao foi possivel criar a conta.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
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
