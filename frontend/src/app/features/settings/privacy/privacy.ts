import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nzola-privacy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './privacy.html',
  styleUrls: ['./privacy.scss']
})
export class PrivacyComponent {
  privacySettings = {
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showLocation: true,
    allowMentions: true,
    allowDMs: true
  };

  constructor(private router: Router) {}

  saveChanges(): void {
    console.log('Guardar configurações de privacidade:', this.privacySettings);
    // TODO: Implementar serviço
    this.router.navigate(['/settings']);
  }

  goBack(): void {
    this.router.navigate(['/settings']);
  }
}