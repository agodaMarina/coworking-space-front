import { NgClass } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { Space, SpacesService } from '../../../../core/services/spaces.service';

@Component({
  standalone: true,
  selector: 'app-space-detail-page',
  imports: [NgClass, HeaderComponent, FooterComponent, ProgressSpinnerModule],
  templateUrl: './space-detail.component.html',
  styleUrls: ['./space-detail.component.css']
})
export class SpaceDetailPageComponent implements OnInit {
  space = signal<Space | null>(null);
  loading = signal(false);

  constructor(
    private route: ActivatedRoute,
    private spacesService: SpacesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id) return;
      this.loading.set(true);
      this.spacesService.getSpace(id).subscribe({
        next: (s) => this.space.set(s),
        error: (e) => console.error('Error loading space detail', e),
        complete: () => this.loading.set(false)
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/spaces']);
  }

      // Utility to build seeded picsum URLs safely (encodes names)
      getImageUrl(seed: string, w: number = 800, h: number = 600): string {
        try {
          return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}.jpg`;
        } catch (e) {
          return `https://picsum.photos/${w}/${h}`;
        }
      }

  goToBooking(): void {
    const s = this.space();
    if (!s) return;
    this.router.navigate(['/booking'], { queryParams: { spaceId: s.id } });
  }
}
