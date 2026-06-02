import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'nzola-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrls: ['./about.scss']
})
export class AboutComponent {
  version = '1.0.0';
  
  contributors = [
    { name: 'Nzola Team', role: 'Desenvolvimento e Design' }
  ];

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/settings']);
  }
}