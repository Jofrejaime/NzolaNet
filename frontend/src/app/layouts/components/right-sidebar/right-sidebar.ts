import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../../shared/components/avatar/avatar';

@Component({
  selector: 'nzola-right-sidebar',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  templateUrl: './right-sidebar.html',
  styleUrls: ['./right-sidebar.scss']
})
export class RightSidebarComponent {}