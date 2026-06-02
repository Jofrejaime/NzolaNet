import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'nzola-thread',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './thread.html',
  styleUrls: ['./thread.scss'],
  host: { class: 'block w-full' }
})
export class ThreadComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }
}