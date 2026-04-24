import { CurrencyPipe, NgClass } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Space } from '../../../../core/dtos/space';
import { SpacesService } from '../../../../core/services/spaces.service';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { MessageService } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-space-detail-page',
  imports: [NgClass, CurrencyPipe, HeaderComponent, FooterComponent, ProgressSpinnerModule],
  templateUrl: './space-detail.component.html',
  styleUrls: ['./space-detail.component.css'],
  providers:[MessageService]
})
export class SpaceDetailPageComponent implements OnInit {
  space = signal<Space | null>(null);
  loading = signal(false);
  activePhotoIndex = signal(0);

  constructor(
    private route: ActivatedRoute,
    private spacesService: SpacesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.spacesService.disableMocks();
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id) return;
      this.loading.set(true);
      this.spacesService.getSpace(id).subscribe({
        next: (s) => {
          this.space.set(s);
          const primaryIndex = s.photos?.findIndex((p: any) => p.is_primary);
          this.activePhotoIndex.set(primaryIndex > 0 ? primaryIndex : 0);
        },
        error: (e) => console.error('Error loading space detail', e),
        complete: () => this.loading.set(false)
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/spaces']);
  }

  getActivePhotoUrl(s: Space): string {
    const photos = s.photos ?? [];
    if (photos.length) return photos[this.activePhotoIndex()]?.url ?? 'assets/images/space-placeholder.jpg';
    return s.photo ?? 'assets/images/space-placeholder.jpg';
  }

  getPhotoUrl(photo: any): string {
    return photo?.url ?? 'assets/images/space-placeholder.jpg';
  }

  selectPhoto(index: number): void {
    this.activePhotoIndex.set(index);
  }

  goToBooking(): void {
    const s = this.space();
    if (!s) return;
    this.router.navigate(['/booking'], { queryParams: { spaceId: s.id } });
  }
}
