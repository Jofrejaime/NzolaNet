import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../shared/components/avatar/avatar';
import { Router } from '@angular/router';

@Component({
  selector: 'nzola-profile',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent {
  private router = inject(Router);
  activeTab: 'posts' | 'replies' | 'highlights' | 'media' = 'posts';

  goToAccount(): void {
    this.router.navigate(['/settings/account']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}