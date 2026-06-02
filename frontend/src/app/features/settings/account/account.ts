import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

  user = {
    username: 'nzola_user',
    email: 'nzola@nzolanet.com',
    phone: '+244 923 456 789',
    bio: 'Apaixonado por tecnologia e inovação. Construindo o futuro da conectividade em Angola. 🚀',
    website: 'https://nzolanet.com',
    location: 'Luanda, Angola',
    birthDate: '1990-01-01'
  };

  constructor(private router: Router) {}

  saveChanges(): void {
    this.isLoading.set(true);
    // Simular requisição
    setTimeout(() => {
      this.isLoading.set(false);
      this.savedMessage.set('Alterações guardadas com sucesso!');
      setTimeout(() => this.savedMessage.set(''), 3000);
    }, 1000);
  }

  goBack(): void {
    this.router.navigate(['/settings']);
  }
}