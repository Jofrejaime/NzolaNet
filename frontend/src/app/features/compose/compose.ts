import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'nzola-compose',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compose.html',
  styleUrls: ['./compose.scss'],
  host: { class: 'block w-full' }
})
export class ComposeComponent {
  charCount = 0;

  constructor(private router: Router) {}

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.charCount = textarea.value.length;
  }

  publish(): void {
    this.router.navigate(['/home']);
  }

  close(): void {
    this.router.navigate(['/home']);
  }
}