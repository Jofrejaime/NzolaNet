import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  
  twoFactorEnabled = false;

  constructor(private router: Router) {}

  updatePassword(): void {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      alert('As palavras-passe não coincidem');
      return;
    }
    console.log('Actualizar palavra-passe');
    this.router.navigate(['/settings']);
  }

  toggleTwoFactor(): void {
    this.twoFactorEnabled = !this.twoFactorEnabled;
    console.log('2FA:', this.twoFactorEnabled ? 'activado' : 'desactivado');
  }

  goBack(): void {
    this.router.navigate(['/settings']);
  }
}