import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router'; // Adicionar RouterLink
import { SidebarComponent } from '../components/sidebar/sidebar';
import { RightSidebarComponent } from '../components/right-sidebar/right-sidebar';
import { BottomNavComponent } from '../components/bottom-nav/bottom-nav';

@Component({
  selector: 'nzola-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet,
    RouterLink,  // ← Adicionar RouterLink aqui
    SidebarComponent, 
    RightSidebarComponent,
    BottomNavComponent
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayoutComponent {}