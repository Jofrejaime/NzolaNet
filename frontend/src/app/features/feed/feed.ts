import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'nzola-feed',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './feed.html',
  styleUrls: ['./feed.scss'],
  host: { class: 'block w-full' }
})
export class FeedComponent {
 waveform: number[] = [
    6, 10, 16, 22, 18, 28, 12, 20, 26, 14,
    8,  24, 20, 30, 16, 10, 28, 22, 18, 12,
    26, 8,  20, 14, 30, 18, 10, 24, 16, 22,
  ];
}