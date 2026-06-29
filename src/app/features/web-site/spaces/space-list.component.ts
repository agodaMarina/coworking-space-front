import { NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { Room, RoomListParams } from '../../../core/dtos/room';
import { RoomsService } from '../../../core/services/rooms.service';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  standalone: true,
  selector: 'app-space-list-page',
  imports: [NgClass, FormsModule, HeaderComponent, FooterComponent, ProgressSpinnerModule],
  templateUrl: './space-list.component.html',
  styleUrl: './space-list.component.css',
  providers: [MessageService],
})
export class SpaceListPageComponent implements OnInit {
  readonly roomsService = inject(RoomsService);
  private readonly router = inject(Router);

  readonly rooms      = signal<Room[]>([]);
  readonly nextCursor = signal<string | null>(null);
  readonly hasMore    = signal(false);

  // Filtres
  readonly searchName         = signal('');
  readonly selectedCapacityMin = signal<number>(0);

  readonly capacityOptions = [
    { label: 'Tous', value: 0 },
    { label: '5+',   value: 5 },
    { label: '10+',  value: 10 },
    { label: '20+',  value: 20 },
    { label: '50+',  value: 50 },
  ];

  readonly filteredRooms = computed(() => {
    const minCap = this.selectedCapacityMin();
    return this.rooms().filter(r => r.capacity >= minCap);
  });

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(append = false): void {
    const params: RoomListParams = {
      limit: 20,
      ...(append && this.nextCursor() ? { cursor: this.nextCursor()! } : {}),
      ...(this.searchName() ? { name: this.searchName() } : {}),
      ...(this.selectedCapacityMin() > 0 ? { min_capacity: this.selectedCapacityMin() } : {}),
    };

    this.roomsService.getRooms(params).subscribe({
      next: (res) => {
        this.rooms.set(append ? [...this.rooms(), ...res.items] : res.items);
        this.nextCursor.set(res.next_cursor);
        this.hasMore.set(res.has_more);
      },
      error: (err) => console.error('Erreur chargement des salles', err),
    });
  }

  loadMore(): void {
    if (this.hasMore()) this.loadRooms(true);
  }

  applyFilters(): void {
    this.nextCursor.set(null);
    this.loadRooms();
  }

  selectCapacity(value: number): void {
    this.selectedCapacityMin.set(value);
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchName.set('');
    this.selectedCapacityMin.set(0);
    this.nextCursor.set(null);
    this.loadRooms();
  }

  openDetail(room: Room): void {
    this.router.navigate(['/rooms', room.id]);
  }

  goToBooking(room: Room): void {
    this.router.navigate(['/booking'], { queryParams: { roomId: room.id } });
  }

  activeReservationsCount(room: Room): number {
    const now = new Date();
    return room.reservations?.filter(r => new Date(r.end_time) > now).length ?? 0;
  }

  getRoomImage(roomId: string, w = 600, h = 400): string {
    return `https://picsum.photos/seed/${roomId}/${w}/${h}`;
  }
}
