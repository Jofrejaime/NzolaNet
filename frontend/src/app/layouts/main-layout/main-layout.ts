import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar';
import { RightSidebarComponent } from '../components/right-sidebar/right-sidebar';
import { BottomNavComponent } from '../components/bottom-nav/bottom-nav';

@Component({
  selector: 'nzola-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    SidebarComponent, 
    RightSidebarComponent,
    BottomNavComponent  // ← Adicionar esta linha
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayoutComponent {}