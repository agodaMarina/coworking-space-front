import { DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Room, RoomReservation } from '../../../core/dtos/room';
import { RoomsService } from '../../../core/services/rooms.service';
import { ToastService } from '../../../core/services/toast.service';

// Vue plate d'une réservation avec le contexte de sa salle
interface ReservationView {
  id:        string;
  roomName:  string;
  roomId:    string;
  startTime: string;
  endTime:   string;
  isUpcoming: boolean;
}

@Component({
  standalone: true,
  selector: 'app-admin-overview',
  imports: [NgClass, DatePipe, RouterLink],
  templateUrl: './overview.component.html',
  providers: [MessageService],
})
export class AdminOverviewComponent implements OnInit {
  private readonly roomsService = inject(RoomsService);
  private readonly toast        = inject(ToastService);

  readonly rooms           = signal<Room[]>([]);
  readonly isLoading       = signal(true);
  readonly allReservations = signal<ReservationView[]>([]);

  readonly stats = computed(() => {
    const now   = new Date();
    const rooms = this.rooms();
    const res   = this.allReservations();
    return {
      totalRooms:    rooms.length,
      totalCapacity: rooms.reduce((sum, r) => sum + r.capacity, 0),
      upcoming:      res.filter(r => r.isUpcoming).length,
      total:         res.length,
    };
  });

  readonly recentReservations = computed(() =>
    [...this.allReservations()]
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 8)
  );

  ngOnInit(): void {
    this.loadData(null);
  }

  private loadData(cursor: string | null): void {
    this.isLoading.set(true);
    this.roomsService.getRooms({ limit: 100, ...(cursor ? { cursor } : {}) }).subscribe({
      next: (res) => {
        this.rooms.update(list => [...list, ...res.items]);
        const now = new Date();
        const views: ReservationView[] = res.items.flatMap(room =>
          (room.reservations ?? []).map(r => ({
            id:         r.id,
            roomName:   room.name,
            roomId:     room.id,
            startTime:  r.start_time,
            endTime:    r.end_time,
            isUpcoming: new Date(r.end_time) > now,
          }))
        );
        this.allReservations.update(list => [...list, ...views]);

        if (res.has_more && res.next_cursor) {
          this.loadData(res.next_cursor);
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.showError('Impossible de charger les données.');
      },
    });
  }
}
