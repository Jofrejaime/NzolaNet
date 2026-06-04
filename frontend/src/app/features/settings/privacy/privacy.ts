import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'nzola-privacy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './privacy.html',
  styleUrls: ['./privacy.scss']
})
export class PrivacyComponent implements OnInit {
  isPrivate = signal(false);
  isSaving = signal(false);

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.isPrivate.set(!!this.authService.currentUser()?.is_private);
  }

  saveChanges(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.isSaving.set(true);
    this.userService
      .updateProfile({
        name: user.name,
        bio: user.bio || '',
        is_private: this.isPrivate(),
      })
      .subscribe({
        next: (updated) => {
          this.authService.setUser(updated);
          this.isSaving.set(false);
          this.toast.success('Guardado', 'Privacidade actualizada.');
          this.router.navigate(['/settings']);
        },
        error: () => {
          this.isSaving.set(false);
          this.toast.error('Erro', 'Não foi possível guardar a privacidade.');
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/settings']);
  }
}
