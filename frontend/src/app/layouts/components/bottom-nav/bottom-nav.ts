import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { RealtimeService } from '../../../core/services/realtime.service';

@Component({
  selector: 'nzola-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.html',
  styleUrls: ['./bottom-nav.scss']
})
export class BottomNavComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private realtimeService = inject(RealtimeService);

  unreadCount = signal(0);
  private unreadCountSub?: Subscription;

  ngOnInit(): void {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    // Subscribe to the shared unread count observable from RealtimeService
    // The SidebarComponent is responsible for loading the initial count from API
    this.unreadCountSub = this.realtimeService.unreadCount$.subscribe((count) => {
      this.unreadCount.set(count);
    });
  }

  ngOnDestroy(): void {
    this.unreadCountSub?.unsubscribe();
  }

  closeMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
      mobileMenu.classList.remove('open');
    }
  }
}