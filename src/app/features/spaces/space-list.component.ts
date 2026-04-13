import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Select } from 'primeng/select';
import { Slider } from 'primeng/slider';
import { TableModule } from 'primeng/table';
import { Space, SpacesService } from '../../core/services/spaces.service';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

// interface Space {
//   id: number;
//   name: string;
//   space_type: string;
//   space_type_display: string;
//   description: string;
//   capacity: number;
//   price_per_hour: number;
//   price_per_day: number;
//   address: string;
//   is_available: boolean;
//   photo?: string;
//   photos: any[];
//   amenities: Amenity[];
//   created_at: string;
// }

interface Amenity {
    id: number;
    name: string;
    icon: string;
}

@Component({
    standalone: true,
    selector: 'app-space-list-page',
    imports: [
        CommonModule,
        FormsModule,
        HeaderComponent,
        FooterComponent,
        Button,
        TableModule,
        Dialog,
        Select,
        Slider,
        ProgressSpinnerModule,
    ],
    template: `
    <div class="page-shell">
      <app-header></app-header>
      <main class="content-shell">
        <!-- Hero Section -->
        <section class="listing-hero">
          <h1>Our Spaces</h1>
          <p>Explore our curated selection of flexible workspaces designed to meet your needs.</p>
        </section>

        <!-- Filters Section -->
        <section class="filters-section">
          <div class="filter-group">
            <label>Space Type</label>
            <p-select
              [options]="typeOptions"
              [(ngModel)]="selectedType"
              optionLabel="label"
              optionValue="value"
              placeholder="All Types"
              class="filter-dropdown">
            </p-select>
          </div>

          <div class="filter-group">
            <label>Capacity: {{ capacityRange()[0] }} - {{ capacityRange()[1] }} persons</label>
            <p-slider
              [(ngModel)]="capacityRangeMin"
              [min]="0"
              [max]="100"
              (onChange)="updateCapacityRange()"
              class="filter-slider">
            </p-slider>
          </div>

          <div class="filter-actions">
            <button type="button" (click)="resetFilters()" class="btn-reset">
              <i class="pi pi-filter-slash"></i> Reset
            </button>
            <span class="result-count">{{ filteredSpaces().length }} space(s) available</span>
          </div>
        </section>

        <!-- Desktop DataTable View -->
        <section class="table-container-desktop" [style.position]="'relative'">
          <div *ngIf="spacesService.isLoading()" class="loading-overlay">
            <p-progressSpinner></p-progressSpinner>
          </div>
          <p-table [value]="filteredSpaces()" class="spaces-table" [loading]="spacesService.isLoading()">
            <ng-template pTemplate="header">
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Price</th>
                <th style="width: 13rem">Actions</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-space>
              <tr>
                <td><strong>{{ space.name }}</strong></td>
                <td><span class="type-badge" [ngClass]="'type-' + space.space_type">{{ space.space_type_display }}</span></td>
                <td>{{ space.capacity }}</td>
                <td><strong>{{ '$' + space.price_per_day }}/day</strong></td>
                <td class="actions-cell">
                  <p-button type="button" (click)="openDetail(space)" icon="pi pi-eye">View</p-button>
                  <p-button type="button" (click)="goToBooking(space)" icon="pi pi-calendar">Book</p-button>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="5" class="empty-state">No spaces found matching your filters.</td>
              </tr>
            </ng-template>
          </p-table>
        </section>

        <!-- Mobile Card View -->
        <section class="space-grid-mobile">
          <article class="space-card" *ngFor="let space of filteredSpaces()">
            <div class="card-header">
              <span class="type-badge" [ngClass]="'type-' + space.space_type">{{ space.space_type_display }}</span>
              <h2>{{ space.name }}</h2>
            </div>
            <p class="card-description">{{ space.description }}</p>
            <div class="card-meta">
              <span class="capacity-info">
                <i class="pi pi-users"></i>
                {{ space.capacity }} persons
              </span>
              <span class="price-info">
                <i class="pi pi-tag"></i>
                {{ '$' + space.price_per_day }}/day
              </span>
            </div>
            <div class="card-actions">
              <p-button type="button" (click)="openDetail(space)" icon="pi pi-eye">View Details</p-button>
              <p-button type="button" (click)="goToBooking(space)" severity="success" icon="pi pi-calendar">Book Now</p-button>
            </div>
          </article>
        </section>
      </main>

      <!-- Detail Modal Dialog -->
    <p-dialog
        [visible]="showDetailModal()"
        (visibleChange)="showDetailModal.set($event)"
        [modal]="true"
        [style]="{width: '600px'}"
        [closable]="true"
        header="Space Details"
        (onHide)="closeDetail()">
        <div class="modal-content" *ngIf="selectedSpace()">
          <div class="detail-section">
            <h3>Description</h3>
            <p>{{ selectedSpace()?.description }}</p>
          </div>

          <div class="detail-section">
            <h3>Details</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Type:</span>
                  <span class="type-badge" [ngClass]="'type-' + selectedSpace()!.space_type">{{ selectedSpace()!.space_type_display }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Capacity:</span>
                <span class="value">{{ selectedSpace()!.capacity }} persons</span>
              </div>
              <div class="detail-item">
                <span class="label">Price:</span>
                <span class="value">{{ '$' + selectedSpace()!.price_per_day }}/day</span>
              </div>
              <div class="detail-item">
                <span class="label">Currency:</span>
                <span class="value">{{ selectedSpace()!.price_per_hour }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Amenities</h3>
            <ul class="amenities-list">
              <li *ngFor="let amenity of selectedSpace()!.amenities">
                <i class="{{ amenity.icon }}"></i>
                {{ amenity.name }}
              </li>
            </ul>
          </div>

          <div class="modal-footer">
            <p-button type="button" (click)="closeDetail()">Cancel</p-button>
            <p-button type="button" (click)="goToBooking(selectedSpace()!)" severity="success">Book This Space</p-button>
          </div>
        </div>
      </p-dialog>
      <app-footer></app-footer>
    </div>
  `,
    styles: [
        `
      :host ::ng-deep {
        .page-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
        }
        .content-shell {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          flex: 1;
          width: 100%;
        }

        /* Hero Section */
        .listing-hero {
          margin-bottom: 3rem;
        }
        .listing-hero h1 {
          font-size: 2.5rem;
          color: #0f172a;
          margin: 0 0 1rem;
        }
        .listing-hero p {
          color: #475569;
          margin: 0;
          font-size: 1.1rem;
        }

        /* Filters Section */
        .filters-section {
          display: grid;
          grid-template-columns: 1fr 2fr auto;
          gap: 1.5rem;
          align-items: end;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: white;
          border-radius: 1.25rem;
          border: 1px solid rgba(148, 163, 184, 0.1);
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .filter-group label {
          font-weight: 600;
          color: #0f172a;
          font-size: 0.9rem;
        }
        .filter-select,
        .filter-range,
        .filter-dropdown,
        .filter-slider {
          width: 100%;
          padding: 0.6rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.95rem;
          color: #0f172a;
        }
        .filter-select:focus,
        .filter-range:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .filter-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .btn-reset {
          padding: 0.6rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }
        .btn-reset:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }
        .result-count {
          color: #475569;
          font-weight: 600;
          white-space: nowrap;
        }

        /* Desktop Table View */
        .table-container-desktop {
          display: block;
          margin-bottom: 2rem;
          position: relative;
        }
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 1.25rem;
          z-index: 10;
        }
        .spaces-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 1.25rem;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.1);
        }
        .spaces-table thead {
          background: #f1f5f9;
        }
        .spaces-table th {
          color: #0f172a;
          font-weight: 700;
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }
        .spaces-table td {
          padding: 1rem;
          color: #475569;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }
        .spaces-table tbody tr:hover {
          background: #f8fafc;
        }
        .actions-cell {
          display: flex;
          gap: 0.5rem;
        }
        .btn-small {
          padding: 0.4rem 0.8rem;
          font-size: 0.85rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }
        .btn-info {
          background: #dbeafe;
          color: #1e40af;
        }
        .btn-info:hover {
          background: #bfdbfe;
        }
        .btn-success {
          background: #dcfce7;
          color: #15803d;
        }
        .btn-success:hover {
          background: #bbf7d0;
        }
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #64748b;
        }

        /* Type Badge */
        .type-badge {
          display: inline-block;
          padding: 0.35rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .type-desk {
          background: rgba(59, 130, 246, 0.1);
          color: #1e40af;
        }
        .type-open_space {
          background: rgba(16, 185, 129, 0.1);
          color: #065f46;
        }
        .type-meeting_room {
          background: rgba(245, 158, 11, 0.1);
          color: #92400e;
        }
        .type-private {
          background: rgba(168, 85, 247, 0.1);
          color: #6b21a8;
        }
        .type-conference {
          background: rgba(236, 72, 153, 0.1);
          color: #831843;
        }

        /* Mobile Card View */
        .space-grid-mobile {
          display: none;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        .space-card {
          padding: 1.5rem;
          border-radius: 1.25rem;
          background: white;
          border: 1px solid rgba(148, 163, 184, 0.1);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .card-header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .space-card h2 {
          margin: 0;
          color: #0f172a;
          font-size: 1.25rem;
        }
        .card-description {
          margin: 0;
          color: #475569;
          font-size: 0.95rem;
        }
        .card-meta {
          display: flex;
          gap: 1.5rem;
          color: #64748b;
          font-size: 0.9rem;
        }
        .capacity-info,
        .price-info {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .card-actions {
          display: flex;
          gap: 0.75rem;
        }
        .btn-card {
          flex: 1;
          padding: 0.7rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-card:not(.btn-success) {
          background: #dbeafe;
          color: #1e40af;
        }
        .btn-card:not(.btn-success):hover {
          background: #bfdbfe;
        }
        .btn-card.btn-success {
          background: #10b981;
          color: white;
        }
        .btn-card.btn-success:hover {
          background: #059669;
        }

        /* Modal */
        .modal-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .detail-section h3 {
          margin: 0 0 1rem;
          color: #0f172a;
          font-size: 1.1rem;
        }
        .detail-section p {
          margin: 0;
          color: #475569;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .detail-item .label {
          font-weight: 600;
          color: #64748b;
          font-size: 0.9rem;
        }
        .detail-item .value {
          color: #0f172a;
        }
        .amenities-list {
          margin: 0;
          padding-left: 0;
          list-style: none;
        }
        .amenities-list li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #475569;
          margin-bottom: 0.5rem;
        }
        .amenities-list i {
          color: #10b981;
          flex-shrink: 0;
        }
        .modal-footer {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          justify-content: flex-end;
        }
        .btn-primary,
        .btn-secondary {
          padding: 0.6rem 1.2rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-secondary {
          background: #f1f5f9;
          color: #475569;
        }
        .btn-secondary:hover {
          background: #e2e8f0;
        }
        .btn-primary {
          background: #2563eb;
          color: white;
        }
        .btn-primary:hover {
          background: #1d4ed8;
        }
        .btn-primary.btn-success {
          background: #10b981;
        }
        .btn-primary.btn-success:hover {
          background: #059669;
        }

        /* Responsive Breakpoints */
        @media (max-width: 768px) {
          .filters-section {
            grid-template-columns: 1fr;
            align-items: stretch;
          }
          .filter-actions {
            flex-direction: column;
            align-items: stretch;
          }
          .btn-reset {
            width: 100%;
          }

          /* Hide table, show cards on mobile */
          .table-container-desktop {
            display: none;
          }
          .space-grid-mobile {
            display: grid;
          }

          .listing-hero h1 {
            font-size: 2rem;
          }
          .detail-grid {
            grid-template-columns: 1fr;
          }
          .actions-cell {
            flex-direction: column;
          }
        }
      }
    `,
    ],
})
export class SpaceListPageComponent implements OnInit {
    // State signals
    spaces = signal<Space[]>([]);
    selectedSpace = signal<Space | null>(null);
    showDetailModal = signal(false);
    selectedType = signal<string | null>(null);
    capacityRange = signal<[number, number]>([0, 100]);
    capacityRangeMin = 0;
    capacityRangeMax = 100;

    // Filter options
    typeOptions = [
        { label: 'Desk', value: 'desk' },
        { label: 'Open Space', value: 'open_space' },
        { label: 'Meeting Room', value: 'meeting_room' },
        { label: 'Private Office', value: 'private' },
        { label: 'Conference Room', value: 'conference' },
    ];

    // Computed filtered spaces
    filteredSpaces = computed(() => {
        const type = this.selectedType();
        const [minCap, maxCap] = this.capacityRange();

        return this.spaces().filter(space => {
            const typeMatch = !type || space.space_type === type;
            const capacityMatch = space.capacity >= minCap && space.capacity <= maxCap;
            return typeMatch && capacityMatch;
        });
    });

    constructor(public spacesService: SpacesService) { }

    ngOnInit() {
        this.loadSpaces();
    }

    loadSpaces() {
        this.spacesService.getSpaces().subscribe({
            next: (spaces) => this.spaces.set(spaces),
            error: (error) => console.error('Error loading spaces:', error)
        });
    }

    openDetail(space: Space) {
        this.selectedSpace.set(space);
        this.showDetailModal.set(true);
    }

    closeDetail() {
        this.showDetailModal.set(false);
        this.selectedSpace.set(null);
    }

    updateCapacityRange() {
        this.capacityRange.set([this.capacityRangeMin, this.capacityRangeMax]);
    }

    resetFilters() {
        this.selectedType.set(null);
        this.capacityRange.set([0, 100]);
        this.capacityRangeMin = 0;
        this.capacityRangeMax = 100;
    }

    goToBooking(space: Space) {
        // Will be implemented with router in Phase 3
        console.log('Navigate to booking for space:', space.name);
        // this.router.navigate(['/booking'], { queryParams: { spaceId: space.id } });
    }
}
// import { HeaderComponent } from '../../shared/components/header/header.component';

// @Component({
//   standalone: true,
//   selector: 'app-space-list-page',
//   imports: [CommonModule, HeaderComponent, FooterComponent, RouterLink],
//   template: `
//     <div class="page-shell">
//       <app-header></app-header>
//       <main class="content-shell">
//         <section class="listing-hero">
//           <h1>Nos espaces</h1>
//           <p>Choisissez l’espace ou la salle de réunion qui correspond à votre équipe.</p>
//         </section>
//         <section class="space-grid">
//           <article class="space-card" *ngFor="let space of spaces">
//             <div>
//               <p class="space-type">{{ space.type }}</p>
//               <h2>{{ space.name }}</h2>
//               <p>{{ space.description }}</p>
//             </div>
//             <div class="space-meta">
//               <span>{{ space.capacity }} personnes</span>
//               <a [routerLink]="['/spaces', space.id]">Voir</a>
//             </div>
//           </article>
//         </section>
//       </main>
//       <app-footer></app-footer>
//     </div>
//   `,
//   styles: [
//     `
//       .page-shell {
//         min-height: 100vh;
//         display: flex;
//         flex-direction: column;
//         background: #f8fafc;
//       }
//       .content-shell {
//         width: min(1200px, 100%);
//         margin: 0 auto;
//         padding: 2rem 1.5rem 4rem;
//       }
//       .listing-hero {
//         margin-bottom: 2rem;
//       }
//       .listing-hero h1 {
//         margin: 0 0 0.75rem;
//         font-size: 2.5rem;
//         color: #0f172a;
//       }
//       .listing-hero p {
//         margin: 0;
//         color: #475569;
//       }
//       .space-grid {
//         display: grid;
//         gap: 1.5rem;
//       }
//       .space-card {
//         display: flex;
//         justify-content: space-between;
//         align-items: flex-start;
//         gap: 1rem;
//         padding: 1.5rem;
//         border-radius: 1.25rem;
//         background: white;
//         border: 1px solid rgba(148, 163, 184, 0.24);
//       }
//       .space-type {
//         margin: 0 0 0.5rem;
//         text-transform: uppercase;
//         letter-spacing: 0.12em;
//         color: #2563eb;
//         font-size: 0.8rem;
//         font-weight: 700;
//       }
//       .space-card h2 {
//         margin: 0 0 0.75rem;
//         color: #0f172a;
//       }
//       .space-card p {
//         margin: 0;
//         color: #475569;
//       }
//       .space-meta {
//         display: grid;
//         justify-content: end;
//         gap: 0.75rem;
//         text-align: right;
//       }
//       .space-meta span {
//         font-weight: 700;
//         color: #0f172a;
//       }
//       .space-meta a {
//         color: #2563eb;
//         text-decoration: none;
//       }
//     `,
//   ],
// })
// export class SpaceListPageComponent {
//   readonly spaces = [
//     {
//       id: '1',
//       name: 'Open Space Lumière',
//       type: 'Open space',
//       description: 'Grande surface partagée avec postes flexibles et café à volonté.',
//       capacity: 18,
//     },
//     {
//       id: '2',
//       name: 'Salle Réunion Confort',
//       type: 'Salle de réunion',
//       description: 'Salle équipée pour 10 personnes, écran et visioconférence.',
//       capacity: 10,
//     },
//     {
//       id: '3',
//       name: 'Bureau Privé Premium',
//       type: 'Bureau privé',
//       description: 'Bureau fermé pour 4 personnes avec confidentialité et calme.',
//       capacity: 4,
//     },
//   ];
// }
