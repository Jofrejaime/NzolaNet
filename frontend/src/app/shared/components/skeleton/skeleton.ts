import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nzola-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.html',
  styleUrls: ['./skeleton.scss']
})
export class SkeletonComponent {
  @Input() variant: 'post' | 'comment' | 'user' | 'profile-header' = 'post';
}