import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'nzola-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  host: { class: 'block w-full' }
})
export class LoginComponent {
  activeTab: 'entrar' | 'criar' = 'entrar';

  constructor(private router: Router) {}

  login(): void {
    this.router.navigate(['/home']);
  }

  register(): void {
    this.router.navigate(['/home']);
  }
}