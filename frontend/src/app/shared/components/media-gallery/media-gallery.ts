import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostMedia } from '../../../core/models/api.models';
import { ApiUrlService } from '../../../core/services/api-url.service';

@Component({
  selector: 'nzola-media-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media-gallery.html',
  styleUrls: ['./media-gallery.scss'],
})
export class MediaGalleryComponent {
  @Input() items: PostMedia[] = [];

  constructor(private apiUrl: ApiUrlService) {}

  url(path: string): string | null {
    return this.apiUrl.storageUrl(path);
  }

  get count(): number {
    return Math.min(this.items.length, 4);
  }
}
