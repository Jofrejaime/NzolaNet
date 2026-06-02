import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'nzola-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.html',
  styleUrls: ['./bottom-nav.scss']
})
export class BottomNavComponent {
  closeMenu() {
    // Fechar menu mobile se existir
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
      mobileMenu.classList.remove('open');
    }
  }
}