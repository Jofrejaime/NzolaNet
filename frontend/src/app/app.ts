import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    ToastComponent  // Certifica que o caminho está correcto
  ],
  template: `
    <router-outlet></router-outlet>
    <nzola-toast />
  `
})
export class AppComponent {}