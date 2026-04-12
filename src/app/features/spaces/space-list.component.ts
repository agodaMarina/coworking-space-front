import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

interface Space {
  id: number;
  name: string;
  type: string;
  description: string;
  capacity: number;
  price: number;
  currency: string;
  amenities: string[];
}

@Component({
  standalone: true,
  selector: 'app-space-list-page',
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    FooterComponent,
    ButtonModule,
    TableModule,
    DialogModule,
    CardModule,
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
            <label for="type-filter">Space Type</label>
            <select id="type-filter" [(ngModel)]="selectedType" class="filter-select">
              <option [value]="null">All Types</option>
              <option *ngFor="let opt of typeOptions" [value]="opt.value">{{ opt.label }}</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="capacity-filter">Capacity: {{ capacityRange()[0] }} - {{ capacityRange()[1] }} persons</label>
            <input
              id="capacity-filter"
              type="range"
              [(ngModel)]="capacityRangeMin"
              [min]="0"
              [max]="100"
              class="filter-range"
              (change)="updateCapacityRange()">
          </div>

          <div class="filter-actions">
            <button type="button" (click)="resetFilters()" class="btn-reset">
              <i class="pi pi-filter-slash"></i> Reset
            </button>
            <span class="result-count">{{ filteredSpaces().length }} space(s) available</span>
          </div>
        </section>

        <!-- Desktop DataTable View -->
        <section class="table-container-desktop">
          <table class="spaces-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Price</th>
                <th style="width: 13rem">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let space of filteredSpaces()">
                <td><strong>{{ space.name }}</strong></td>
                <td><span class="type-badge" [ngClass]="'type-' + space.type">{{ space.type }}</span></td>
                <td>{{ space.capacity }}</td>
                <td><strong>{{ '$' + space.price }}/day</strong></td>
                <td class="actions-cell">
                  <button type="button" (click)="openDetail(space)" class="btn-small btn-info" pButton icon="pi pi-eye">View</button>
                  <button type="button" (click)="goToBooking(space)" class="btn-small btn-success" pButton icon="pi pi-calendar">Book</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="empty-state" *ngIf="filteredSpaces().length === 0">
            <p>No spaces found matching your filters.</p>
          </div>
        </section>

        <!-- Mobile Card View -->
        <section class="space-grid-mobile">
          <article class="space-card" *ngFor="let space of filteredSpaces()">
            <div class="card-header">
              <span class="type-badge" [ngClass]="'type-' + space.type">{{ space.type }}</span>
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
                {{ '$' + space.price }}/day
              </span>
            </div>
            <div class="card-actions">
              <button type="button" (click)="openDetail(space)" class="btn-card" pButton icon="pi pi-eye">View Details</button>
              <button type="button" (click)="goToBooking(space)" class="btn-card btn-success" pButton icon="pi pi-calendar">Book Now</button>
            </div>
          </article>
        </section>
      </main>

      <!-- Detail Modal Dialog -->
      <div [class.active]="showDetailModal()" class="modal-overlay" (click)="closeDetail()">
        <div class="modal-dialog" (click)="$event.stopPropagation()" *ngIf="selectedSpace()">
          <div class="modal-header">
            <h2>{{ selectedSpace()?.name }}</h2>
            <button type="button" (click)="closeDetail()" class="btn-close">&times;</button>
          </div>
          <div class="modal-content">
            <div class="detail-section">
              <h3>Description</h3>
              <p>{{ selectedSpace()!.description }}</p>
            </div>

            <div class="detail-section">
              <h3>Details</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">Type:</span>
                  <span class="type-badge" [ngClass]="'type-' + selectedSpace()!.type">{{ selectedSpace()!.type }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Capacity:</span>
                  <span class="value">{{ selectedSpace()!.capacity }} persons</span>
                </div>
                <div class="detail-item">
                  <span class="label">Price:</span>
                  <span class="value">{{ '$' + selectedSpace()!.price }}/day</span>
                </div>
                <div class="detail-item">
                  <span class="label">Currency:</span>
                  <span class="value">{{ selectedSpace()!.currency }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h3>Amenities</h3>
              <ul class="amenities-list">
                <li *ngFor="let amenity of selectedSpace()!.amenities">
                  <i class="pi pi-check"></i>
                  {{ amenity }}
                </li>
              </ul>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeDetail()" class="btn-secondary">Cancel</button>
              <button type="button" (click)="goToBooking(selectedSpace()!)" class="btn-primary btn-success">Book This Space</button>
            </div>
          </div>
        </div>
      </div>
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
        .filter-range {
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
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s, visibility 0.3s;
        }
        .modal-overlay.active {
          opacity: 1;
          visibility: visible;
        }
        .modal-dialog {
          background: white;
          border-radius: 1.25rem;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }
        .modal-header h2 {
          margin: 0;
          color: #0f172a;
        }
        .btn-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #64748b;
          cursor: pointer;
          padding: 0;
        }
        .modal-content {
          padding: 1.5rem;
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
      const typeMatch = !type || space.type === type;
      const capacityMatch = space.capacity >= minCap && space.capacity <= maxCap;
      return typeMatch && capacityMatch;
    });
  });

  ngOnInit() {
    this.loadSpaces();
  }

  loadSpaces() {
    const mock: Space[] = [
      {
        id: 1,
        name: 'Downtown Desk #1',
        type: 'desk',
        description: 'Modern dedicated desk with high-speed internet and natural light',
        capacity: 1,
        price: 25,
        currency: 'USD',
        amenities: ['Wi-Fi 5G', 'Standing Desk', 'Monitor', 'Coffee Machine', 'Parking'],
      },
      {
        id: 2,
        name: 'Collaborative Space',
        type: 'open_space',
        description: 'Open layout perfect for team collaboration and creative work',
        capacity: 10,
        price: 150,
        currency: 'USD',
        amenities: ['Wi-Fi 5G', 'Whiteboard', 'Printer', 'Kitchen', 'Lounge Area'],
      },
      {
        id: 3,
        name: 'Executive Meeting Room',
        type: 'meeting_room',
        description: 'Premium room with video conferencing and professional setup',
        capacity: 8,
        price: 75,
        currency: 'USD',
        amenities: ['Video Conference', 'Projector', 'Smart Board', 'Coffee Service', 'Catering'],
      },
      {
        id: 4,
        name: 'Private Office Suite',
        type: 'private',
        description: 'Fully furnished private office with dedicated entrance and utilities',
        capacity: 5,
        price: 120,
        currency: 'USD',
        amenities: ['Dedicated Entrance', 'Phone Line', 'Wi-Fi', 'Utilities Included', 'Receptionist'],
      },
      {
        id: 5,
        name: 'Conference Hall',
        type: 'conference',
        description: 'Large conference room suitable for presentations and large meetings',
        capacity: 50,
        price: 300,
        currency: 'USD',
        amenities: ['AV System', 'Stadium Seating', 'Simultaneous Translation', 'Catering', 'Recording'],
      },
      {
        id: 6,
        name: 'Tech Startup Hub',
        type: 'open_space',
        description: 'Vibrant space designed for tech teams and startups',
        capacity: 15,
        price: 200,
        currency: 'USD',
        amenities: ['High-Speed Wi-Fi', 'Server Rack', 'Networking Events', 'Mentorship', 'Pitch Deck Room'],
      },
      {
        id: 7,
        name: 'Creative Studio Desk',
        type: 'desk',
        description: 'Bright creative workspace perfect for designers and artists',
        capacity: 1,
        price: 35,
        currency: 'USD',
        amenities: ['Monitor', 'Ergonomic Chair', 'Drafting Table', 'Natural Light', 'Art Supplies'],
      },
      {
        id: 8,
        name: 'Boardroom Premium',
        type: 'meeting_room',
        description: 'Luxury boardroom with executive amenities and catering service',
        capacity: 12,
        price: 150,
        currency: 'USD',
        amenities: ['Executive Catering', 'Luxury Furniture', 'Video Wall', 'Recording Studio', 'PA System'],
      },
    ];
    this.spaces.set(mock);
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
